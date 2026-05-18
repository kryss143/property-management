create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'manager', 'landlord', 'tenant');
create type property_status as enum ('active', 'inactive', 'maintenance');
create type unit_status as enum ('available', 'occupied', 'maintenance');
create type lease_status as enum ('active', 'expired', 'upcoming');
create type payment_status as enum ('paid', 'pending', 'overdue', 'partial');
create type maintenance_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type maintenance_priority as enum ('low', 'medium', 'high', 'urgent');

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

create index idx_units_property_id on units(property_id);
create index idx_tenants_property_id on tenants(property_id);
create index idx_leases_tenant_id on leases(tenant_id);
create index idx_payments_due_date on payments(due_date);
create index idx_maintenance_status on maintenance_requests(status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'New user'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'tenant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table payments enable row level security;
alter table maintenance_requests enable row level security;
alter table maintenance_images enable row level security;

create policy "profiles can read own profile"
on profiles for select
using (auth.uid() = id);

create policy "profiles can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "authenticated users can read properties"
on properties for select
to authenticated
using (true);

create policy "authenticated users can read units"
on units for select
to authenticated
using (true);

create policy "authenticated users can read tenants"
on tenants for select
to authenticated
using (true);

create policy "authenticated users can read leases"
on leases for select
to authenticated
using (true);

create policy "authenticated users can read payments"
on payments for select
to authenticated
using (true);

create policy "authenticated users can read maintenance"
on maintenance_requests for select
to authenticated
using (true);

create policy "authenticated users can read maintenance images"
on maintenance_images for select
to authenticated
using (true);
