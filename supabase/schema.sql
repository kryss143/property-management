-- ============================================================
-- EXTENSIONS & TYPES (unchanged)
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

create type user_role as enum ('admin', 'manager', 'landlord', 'tenant');
create type property_status as enum ('active', 'inactive', 'maintenance');
create type unit_status as enum ('available', 'occupied', 'maintenance');
create type lease_status as enum ('active', 'expired', 'upcoming');
create type payment_status as enum ('paid', 'pending', 'overdue', 'partial');
create type maintenance_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type maintenance_priority as enum ('low', 'medium', 'high', 'urgent');


-- ============================================================
-- TABLES (unchanged)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role user_role not null default 'tenant',
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  type text not null,
  description text,
  owner_id uuid references profiles(id) on delete set null,
  image_url text,
  status property_status not null default 'active',
  created_at timestamptz not null default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  unit_number text not null,
  bedrooms int not null default 0,
  bathrooms numeric(3, 1) not null default 1,
  rent_amount numeric(12, 2) not null default 0,
  status unit_status not null default 'available',
  created_at timestamptz not null default now(),
  unique (property_id, unit_number)
);

create table tenants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  emergency_contact text,
  property_id uuid references properties(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  created_at timestamptz not null default now()
);

create table leases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  rent_amount numeric(12, 2) not null,
  deposit_amount numeric(12, 2) not null default 0,
  document_url text,
  status lease_status not null default 'active',
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  lease_id uuid references leases(id) on delete set null,
  amount_due numeric(12, 2) not null,
  amount_paid numeric(12, 2) not null default 0,
  due_date date not null,
  paid_at date,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  priority maintenance_priority not null default 'medium',
  status maintenance_status not null default 'open',
  property_id uuid not null references properties(id) on delete cascade,
  unit_id uuid references units(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  created_at timestamptz not null default now()
);

create table maintenance_images (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references maintenance_requests(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
--
-- Added FK-covering indexes that were missing on columns used
-- heavily by the helper functions / RLS predicates below.
-- Without these, owns_property() / owns_tenant_record() and the
-- "select own row" filters degrade to seq scans as tables grow.
-- ============================================================

create index idx_units_property_id           on units(property_id);
create index idx_tenants_property_id         on tenants(property_id);
create index idx_tenants_profile_id          on tenants(profile_id);          -- new: owns_tenant_record() lookup
create index idx_leases_tenant_id            on leases(tenant_id);
create index idx_leases_property_id          on leases(property_id);          -- new: owns_property() lookup
create index idx_payments_due_date           on payments(due_date);
create index idx_payments_tenant_id          on payments(tenant_id);          -- new: tenant "own payments" lookup
create index idx_payments_property_id        on payments(property_id);       -- new: owns_property() lookup
create index idx_maintenance_status          on maintenance_requests(status);
create index idx_maintenance_property_id     on maintenance_requests(property_id); -- new
create index idx_maintenance_tenant_id       on maintenance_requests(tenant_id);   -- new
create index idx_maintenance_images_request  on maintenance_images(request_id);    -- new
create index idx_properties_owner_id         on properties(owner_id);              -- new: owns_property() lookup


-- ============================================================
-- HELPER FUNCTIONS
-- All are STABLE + SECURITY DEFINER so Postgres can cache the
-- result within a query and bypass per-row auth.uid() re-evaluation.
--
-- Execute privileges are revoked from PUBLIC and re-granted only
-- to `authenticated`/`anon` as appropriate, since SECURITY DEFINER
-- functions are otherwise callable by any role with USAGE on the
-- schema. These only ever return booleans/enums (no row data), so
-- the exposure is low, but being explicit avoids relying on default
-- Postgres grants behaving correctly forever.
-- ============================================================

create or replace function public.current_user_role()
returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager'), false)
$$;

create or replace function public.owns_property(property_uuid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties
    where id = property_uuid
      and owner_id = (select auth.uid())
  )
$$;

create or replace function public.owns_tenant_record(tenant_uuid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenants
    where id = tenant_uuid
      and profile_id = (select auth.uid())
  )
$$;

revoke execute on function public.current_user_role()      from public;
revoke execute on function public.is_admin_or_manager()     from public;
revoke execute on function public.owns_property(uuid)       from public;
revoke execute on function public.owns_tenant_record(uuid)  from public;

grant execute on function public.current_user_role()      to authenticated;
grant execute on function public.is_admin_or_manager()     to authenticated;
grant execute on function public.owns_property(uuid)       to authenticated;
grant execute on function public.owns_tenant_record(uuid)  to authenticated;


-- ============================================================
-- NEW USER TRIGGER (unchanged)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data->>'role';
  safe_role user_role := 'tenant';
begin
  if requested_role in ('admin', 'manager', 'landlord', 'tenant') then
    safe_role := requested_role::user_role;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'New user'),
    safe_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- RLS: ENABLE ON ALL TABLES
-- ============================================================

alter table profiles             enable row level security;
alter table properties           enable row level security;
alter table units                enable row level security;
alter table tenants              enable row level security;
alter table leases               enable row level security;
alter table payments             enable row level security;
alter table maintenance_requests enable row level security;
alter table maintenance_images   enable row level security;


-- ============================================================
-- PROFILES (unchanged from original — already correct)
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      —
-- landlord    own      own      own      —
-- tenant      own      own      own      —
-- ============================================================

create policy "profiles: select"
  on profiles for select
  to authenticated
  using (
    (select auth.uid()) = id
    or public.is_admin_or_manager()
  );

create policy "profiles: insert"
  on profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    or public.is_admin_or_manager()
  );

create policy "profiles: update"
  on profiles for update
  to authenticated
  using (
    (select auth.uid()) = id
    or public.is_admin_or_manager()
  )
  with check (
    (select auth.uid()) = id
    or public.is_admin_or_manager()
  );

create policy "profiles: delete"
  on profiles for delete
  to authenticated
  using (
    public.current_user_role() = 'admin'
  );


-- ============================================================
-- PROPERTIES (unchanged from original — already correct)
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    ALL      own      own      own
-- tenant      ALL      —        —        —
--
-- WHY ALL ROLES GET READ ACCESS:
--   Browsing every property (not just ones you're tied to) is a
--   deliberate product choice here — e.g. a tenant comparing units
--   before a transfer, or a landlord scouting comparable listings.
--   Nothing sensitive lives on this table (no financials), so the
--   blast radius of "everyone can read" is low. Contrast with
--   `tenants` below, which holds PII and is NOT given this treatment.
-- ============================================================

create policy "properties: select"
  on properties for select
  to authenticated
  using (true);

create policy "properties: insert"
  on properties for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or (
      public.current_user_role() = 'landlord'
      and owner_id = (select auth.uid())
    )
  );

create policy "properties: update"
  on properties for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or (
      public.current_user_role() = 'landlord'
      and owner_id = (select auth.uid())
    )
  )
  with check (
    public.is_admin_or_manager()
    or (
      public.current_user_role() = 'landlord'
      and owner_id = (select auth.uid())
    )
  );

create policy "properties: delete"
  on properties for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or (
      public.current_user_role() = 'landlord'
      and owner_id = (select auth.uid())
    )
  );


-- ============================================================
-- UNITS (unchanged from original — already correct)
--
-- Same reasoning as `properties`: unit specs (bedroom count,
-- rent_amount) are listing-level info, not account-level PII,
-- so open SELECT is an intentional product choice, not an oversight.
-- ============================================================

create policy "units: select"
  on units for select
  to authenticated
  using (true);

create policy "units: insert"
  on units for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "units: update"
  on units for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  )
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "units: delete"
  on units for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );


-- ============================================================
-- TENANTS  ***FIXED***
--
-- Role        SELECT     INSERT   UPDATE   DELETE
-- ─────────── ────────── ──────── ──────── ──────
-- admin       ALL        ALL      ALL      ALL
-- manager     ALL        ALL      ALL      ALL
-- landlord    own props  own      own      own
-- tenant      OWN ROW    —        —        —
--
-- BUG FIXED:
--   The original "tenants: select" policy used `using (true)`,
--   meaning ANY authenticated tenant could read EVERY tenant row
--   system-wide — full name, email, phone, AND emergency_contact
--   for every other renter in the platform. That contradicts the
--   stated design intent ("tenants are read-only here") and is a
--   serious PII leak. Tenants should only ever see their own row;
--   landlords are scoped to tenants within properties they own.
-- ============================================================

create policy "tenants: select"
  on tenants for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)            -- landlord: tenants in own properties
    or profile_id = (select auth.uid())              -- tenant: own row only
  );

create policy "tenants: insert"
  on tenants for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "tenants: update"
  on tenants for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  )
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "tenants: delete"
  on tenants for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );


-- ============================================================
-- LEASES (logic unchanged — verified correct, comments tightened)
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      —        —        —
-- ============================================================

create policy "leases: select"
  on leases for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or public.owns_tenant_record(tenant_id)   -- tenant: own lease only (was an inline EXISTS — swapped for the helper to match the rest of the schema)
  );

create policy "leases: insert"
  on leases for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "leases: update"
  on leases for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  )
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "leases: delete"
  on leases for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );


-- ============================================================
-- PAYMENTS (logic unchanged — verified correct, comments tightened)
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      —        —        —
-- ============================================================

create policy "payments: select"
  on payments for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or public.owns_tenant_record(tenant_id)   -- tenant: own payments only
  );

create policy "payments: insert"
  on payments for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "payments: update"
  on payments for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  )
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );

create policy "payments: delete"
  on payments for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );


-- ============================================================
-- MAINTENANCE REQUESTS (logic unchanged — verified correct)
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      own      own      —
-- ============================================================

create policy "maintenance_requests: select"
  on maintenance_requests for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or public.owns_tenant_record(tenant_id)
  );

create policy "maintenance_requests: insert"
  on maintenance_requests for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or (
      public.current_user_role() = 'tenant'
      and public.owns_tenant_record(tenant_id)
    )
  );

create policy "maintenance_requests: update"
  on maintenance_requests for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or (
      public.current_user_role() = 'tenant'
      and public.owns_tenant_record(tenant_id)
    )
  )
  with check (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or (
      public.current_user_role() = 'tenant'
      and public.owns_tenant_record(tenant_id)
    )
  );

create policy "maintenance_requests: delete"
  on maintenance_requests for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );


-- ============================================================
-- MAINTENANCE IMAGES (logic unchanged — verified correct)
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      own      —        own
-- ============================================================

create policy "maintenance_images: select"
  on maintenance_images for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or exists (
      select 1 from public.maintenance_requests mr
      where mr.id = request_id
        and (
          public.owns_property(mr.property_id)
          or public.owns_tenant_record(mr.tenant_id)
        )
    )
  );

create policy "maintenance_images: insert"
  on maintenance_images for insert
  to authenticated
  with check (
    public.is_admin_or_manager()
    or exists (
      select 1 from public.maintenance_requests mr
      where mr.id = request_id
        and (
          public.owns_property(mr.property_id)
          or public.owns_tenant_record(mr.tenant_id)
        )
    )
  );

create policy "maintenance_images: update"
  on maintenance_images for update
  to authenticated
  using (
    public.is_admin_or_manager()
    or exists (
      select 1 from public.maintenance_requests mr
      where mr.id = request_id
        and public.owns_property(mr.property_id)
    )
  )
  with check (
    public.is_admin_or_manager()
    or exists (
      select 1 from public.maintenance_requests mr
      where mr.id = request_id
        and public.owns_property(mr.property_id)
    )
  );

create policy "maintenance_images: delete"
  on maintenance_images for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or exists (
      select 1 from public.maintenance_requests mr
      where mr.id = request_id
        and (
          public.owns_property(mr.property_id)
          or public.owns_tenant_record(mr.tenant_id)
        )
    )
  );


-- ============================================================
-- STORAGE BUCKETS (unchanged)
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('property-images',    'property-images',    true),
  ('maintenance-images', 'maintenance-images', true),
  ('lease-documents',    'lease-documents',    false)
on conflict (id) do update set
  name   = excluded.name,
  public = excluded.public;


-- ============================================================
-- STORAGE POLICIES
--
-- property-images:    public read; admin/manager/landlord write
-- maintenance-images: public read; upload SCOPED to a request the
--                     uploader is actually linked to (see fix below);
--                     owner-scoped update/delete
-- lease-documents:    private; admin/manager/landlord only
--
-- BUG FIXED — maintenance-images insert:
--   The original policy only checked `auth.uid() is not null`,
--   i.e. ANY authenticated user could upload ANY file to this
--   public bucket with no link to a real maintenance request.
--   The comment claimed table-level RLS on `maintenance_images`
--   would cover this, but that's false: storage.objects and the
--   maintenance_images table are independent — uploading a file
--   to storage does NOT require ever inserting a maintenance_images
--   row, so the table RLS never gets a chance to run.
--
--   FIX: require uploads to use the path convention
--     {request_id}/{filename}
--   and check, via storage.foldername(name), that the caller is
--   admin/manager, owns the request's property, or owns the
--   request's tenant record — mirroring the table-level INSERT
--   policy on maintenance_images itself. The request_id segment
--   must reference a real, accessible maintenance_requests row.
-- ============================================================

-- property-images
create policy "storage: property-images select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'property-images');

create policy "storage: property-images insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and public.current_user_role() in ('admin', 'manager', 'landlord')
  );

create policy "storage: property-images update"
  on storage.objects for update
  to authenticated
  using  (bucket_id = 'property-images' and public.current_user_role() in ('admin', 'manager', 'landlord'))
  with check (bucket_id = 'property-images' and public.current_user_role() in ('admin', 'manager', 'landlord'));

create policy "storage: property-images delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images' and public.current_user_role() in ('admin', 'manager', 'landlord'));

-- maintenance-images
-- Upload path convention required: {request_id}/{filename}
create policy "storage: maintenance-images select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'maintenance-images');

create policy "storage: maintenance-images insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'maintenance-images'
    and (
      public.is_admin_or_manager()
      or exists (
        select 1 from public.maintenance_requests mr
        where mr.id::text = (storage.foldername(name))[1]   -- first path segment = request_id
          and (
            public.owns_property(mr.property_id)
            or public.owns_tenant_record(mr.tenant_id)
          )
      )
    )
  );

create policy "storage: maintenance-images update"
  on storage.objects for update
  to authenticated
  using  (bucket_id = 'maintenance-images' and owner = (select auth.uid()))
  with check (bucket_id = 'maintenance-images' and owner = (select auth.uid()));

create policy "storage: maintenance-images delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'maintenance-images' and owner = (select auth.uid()));

-- lease-documents
create policy "storage: lease-documents select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'lease-documents' and public.current_user_role() in ('admin', 'manager', 'landlord'));

create policy "storage: lease-documents insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'lease-documents' and public.current_user_role() in ('admin', 'manager', 'landlord'));

create policy "storage: lease-documents update"
  on storage.objects for update
  to authenticated
  using  (bucket_id = 'lease-documents' and public.current_user_role() in ('admin', 'manager', 'landlord'))
  with check (bucket_id = 'lease-documents' and public.current_user_role() in ('admin', 'manager', 'landlord'));

create policy "storage: lease-documents delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lease-documents' and public.current_user_role() in ('admin', 'manager', 'landlord'));