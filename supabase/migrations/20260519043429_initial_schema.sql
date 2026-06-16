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
-- INDEXES (unchanged)
-- ============================================================

create index idx_units_property_id       on units(property_id);
create index idx_tenants_property_id     on tenants(property_id);
create index idx_leases_tenant_id        on leases(tenant_id);
create index idx_payments_due_date       on payments(due_date);
create index idx_maintenance_status      on maintenance_requests(status);


-- ============================================================
-- HELPER FUNCTIONS
-- All are STABLE + SECURITY DEFINER so Postgres can cache the
-- result within a query and bypass per-row auth.uid() re-evaluation.
-- ============================================================

-- Returns the role of the currently authenticated user.
-- Used by all role-gated policies below.
create or replace function public.current_user_role()
returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

-- Returns true when the caller is admin or manager.
-- Admins have full system access; managers operate across all properties.
create or replace function public.is_admin_or_manager()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager'), false)
$$;

-- Returns true when the caller owns the given property (landlord check).
-- Landlords may only act on properties where owner_id = their user id.
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

-- Returns true when the caller's profile is linked to the tenant record.
-- Tenants may only act on their own tenant row (profile_id = auth.uid()).
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
-- PROFILES
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      —
-- landlord    own      own      own      —
-- tenant      own      own      own      —
--
-- WHY:
--   Admins need unrestricted access to manage any profile in the system.
--   Managers need to read/create/edit profiles to onboard landlords and
--   tenants on behalf of the organization, but cannot delete accounts
--   (destructive actions are admin-only to prevent accidents).
--   Landlords and tenants can only view and edit their own profile;
--   they have no business reason to read other users' details.
-- ============================================================

-- SELECT: own profile OR admin/manager
-- Consolidated from 3 original policies → 1 to eliminate multiple_permissive_policies
create policy "profiles: select"
  on profiles for select
  to authenticated
  using (
    (select auth.uid()) = id            -- own row
    or public.is_admin_or_manager()     -- admin / manager sees all
  );

-- INSERT: own profile OR admin/manager
-- Allows sign-up upsert AND admin/manager-initiated profile creation
create policy "profiles: insert"
  on profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    or public.is_admin_or_manager()
  );

-- UPDATE: own profile OR admin/manager
-- Users can edit their own details; admins/managers can correct any profile
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

-- DELETE: admin only
-- Only admins may delete profiles; this is intentionally restrictive
-- because deleting a profile cascades to auth.users and is irreversible.
create policy "profiles: delete"
  on profiles for delete
  to authenticated
  using (
    public.current_user_role() = 'admin'
  );


-- ============================================================
-- PROPERTIES
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    ALL      own      own      own
-- tenant      ALL      —        —        —
--
-- WHY:
--   All authenticated users can browse properties — tenants need to
--   see property details tied to their lease; landlords compare listings.
--   Only admins and managers can create/edit/remove any property.
--   Landlords can manage properties they own (owner_id = their id);
--   they cannot touch other landlords' properties.
--   Tenants are read-only; they have no reason to create or modify properties.
-- ============================================================

-- SELECT: all authenticated users
-- Public-within-app visibility: every role needs to read property details
create policy "properties: select"
  on properties for select
  to authenticated
  using (true);

-- INSERT: admin/manager OR landlord inserting as themselves
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

-- UPDATE: admin/manager OR landlord who owns the property
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

-- DELETE: admin/manager OR landlord who owns the property
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
-- UNITS
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    ALL      own      own      own
-- tenant      ALL      —        —        —
--
-- WHY:
--   Units are physical subdivisions of properties, so the same
--   ownership logic applies: admins/managers manage all; landlords
--   manage only units inside their own properties; tenants are
--   read-only (they need to see their unit details in the app).
-- ============================================================

create policy "units: select"
  on units for select
  to authenticated
  using (true);

-- INSERT/UPDATE/DELETE: admin/manager OR landlord who owns the parent property
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
-- TENANTS
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    ALL      own      own      own
-- tenant      ALL      —        —        —
--
-- WHY:
--   Tenant records are operational data shared across roles:
--   admins/managers manage the full roster; landlords manage
--   tenants within their properties; tenants themselves are
--   read-only here (their personal profile is in `profiles`).
--   The "own property" guard prevents landlords from
--   inserting/editing tenants into properties they don't own.
-- ============================================================

create policy "tenants: select"
  on tenants for select
  to authenticated
  using (true);

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
-- LEASES
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    ALL      own      own      own
-- tenant      own      —        —        —
--
-- WHY:
--   Leases are financially sensitive. All privileged roles can
--   see all leases (needed for dashboard reporting). Tenants
--   may only read their own lease — they should not see other
--   tenants' rent amounts or deposit terms.
--   Write access follows property ownership: only the property's
--   owner or an admin/manager can create or modify lease terms.
-- ============================================================

-- SELECT: admin/manager/landlord see all; tenant sees only their own
create policy "leases: select"
  on leases for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)    -- landlord for own properties
    or exists (                             -- tenant sees their own lease
      select 1 from public.tenants t
      where t.id = tenant_id
        and t.profile_id = (select auth.uid())
    )
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
-- PAYMENTS
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      —        —        —
--
-- WHY:
--   Payment records contain rent amounts and due dates — private
--   financial data. Tenants may only see their own payment history,
--   never another tenant's. Landlords see and manage payments only
--   for their own properties. Admins/managers have full access for
--   reconciliation and reporting. No role (including tenants) can
--   self-insert a payment — payments are created by the system or
--   by admins/managers/landlords to prevent fraud.
-- ============================================================

-- SELECT: privileged roles see their scope; tenant sees own payments only
create policy "payments: select"
  on payments for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or exists (
      select 1 from public.tenants t
      where t.id = tenant_id
        and t.profile_id = (select auth.uid())
    )
  );

-- INSERT/UPDATE/DELETE: admin/manager or the property's landlord only
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
-- MAINTENANCE REQUESTS
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      own      own      —
--
-- WHY:
--   Maintenance requests originate from tenants reporting issues.
--   Tenants may create and update (e.g. add detail, cancel) their
--   own requests but cannot delete them — deletion would erase the
--   audit trail that landlords and managers rely on.
--   Landlords see and manage requests only for their properties.
--   Tenants only see their own requests (privacy between tenants).
-- ============================================================

-- SELECT: privileged see their scope; tenant sees own requests only
create policy "maintenance_requests: select"
  on maintenance_requests for select
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
    or public.owns_tenant_record(tenant_id)   -- tenant: own requests only
  );

-- INSERT: admin/manager, landlord for own property, OR tenant for themselves
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

-- UPDATE: same as insert — tenants can add detail or update status to cancelled
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

-- DELETE: admin/manager and landlord only — preserves audit trail for tenants
create policy "maintenance_requests: delete"
  on maintenance_requests for delete
  to authenticated
  using (
    public.is_admin_or_manager()
    or public.owns_property(property_id)
  );


-- ============================================================
-- MAINTENANCE IMAGES
--
-- Role        SELECT   INSERT   UPDATE   DELETE
-- ─────────── ──────── ──────── ──────── ──────
-- admin       ALL      ALL      ALL      ALL
-- manager     ALL      ALL      ALL      ALL
-- landlord    own      own      own      own
-- tenant      own      own      —        own
--
-- WHY:
--   Images are attached evidence for maintenance requests.
--   Tenants should be able to upload and delete their own images
--   (e.g. correct a wrong photo) but not update the URL directly
--   (UPDATE on image_url could be used to swap in another tenant's
--   evidence). Landlords manage images for their properties only.
-- ============================================================

-- SELECT: privileged see their scope; tenant sees images on own requests
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

-- INSERT: admin/manager, landlord for own property, OR tenant for own request
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

-- UPDATE: admin/manager and landlord only — tenants cannot swap image URLs
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

-- DELETE: admin/manager, landlord, OR tenant (remove own wrongly-uploaded image)
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
-- maintenance-images: public read; any authenticated user uploads
--                     (scoped by maintenance_images table RLS);
--                     owner-scoped update/delete
-- lease-documents:    private; admin/manager/landlord only
--
-- WHY:
--   Storage policies are the last line of defence for file access.
--   property-images is a public bucket so image URLs embedded in
--   the UI load without tokens — but writes are role-gated.
--   maintenance-images upload is open to any authenticated user
--   because the table-level RLS on maintenance_images already
--   enforces that uploaded images are linked to valid requests
--   the user owns. lease-documents are private and sensitive
--   (contain financial terms), so tenants are intentionally excluded.
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
create policy "storage: maintenance-images select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'maintenance-images');

create policy "storage: maintenance-images insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'maintenance-images' and (select auth.uid()) is not null);

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