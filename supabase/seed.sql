-- ============================================================
-- SEED DATA FOR PROPERTY MANAGEMENT APP
-- ============================================================

-- pgcrypto lives in the extensions schema on Supabase; qualify crypt/gen_salt
create extension if not exists pgcrypto with schema extensions;

-- Clear existing data (order matters due to foreign keys)
truncate table maintenance_images restart identity cascade;
truncate table maintenance_requests restart identity cascade;
truncate table payments restart identity cascade;
truncate table leases restart identity cascade;
truncate table tenants restart identity cascade;
truncate table units restart identity cascade;
truncate table properties restart identity cascade;
truncate table profiles restart identity cascade;

-- Remove seed auth users so re-runs do not conflict
delete from auth.identities
where user_id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
);

delete from auth.users
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
);

-- ============================================================
-- AUTH USERS (required before profiles)
-- ============================================================
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@propmanage.com',
    extensions.crypt('Admin1234!', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name": "System Admin", "role": "admin"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'manager@propmanage.com',
    extensions.crypt('Manager1234!', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name": "Maria Santos", "role": "manager"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'landlord@propmanage.com',
    extensions.crypt('Landlord1234!', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name": "Ricardo Dela Cruz", "role": "landlord"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'tenant1@propmanage.com',
    extensions.crypt('Tenant1234!', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name": "Andrea Reyes", "role": "tenant"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'tenant2@propmanage.com',
    extensions.crypt('Tenant1234!', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name": "Mark Villanueva", "role": "tenant"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000006',
    'authenticated',
    'authenticated',
    'tenant3@propmanage.com',
    extensions.crypt('Tenant1234!', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name": "Sophia Lim", "role": "tenant"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

-- Email identities required for sign-in on current Supabase Auth
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@propmanage.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"manager@propmanage.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '{"sub":"00000000-0000-0000-0000-000000000003","email":"landlord@propmanage.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '{"sub":"00000000-0000-0000-0000-000000000004","email":"tenant1@propmanage.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    '{"sub":"00000000-0000-0000-0000-000000000005","email":"tenant2@propmanage.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000006',
    '{"sub":"00000000-0000-0000-0000-000000000006","email":"tenant3@propmanage.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  );

-- ============================================================
-- PROFILES
-- ============================================================
insert into profiles (id, full_name, email, phone, role) values
  ('00000000-0000-0000-0000-000000000001', 'System Admin',      'admin@propmanage.com',    '+63 912 000 0001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Maria Santos',      'manager@propmanage.com',  '+63 912 000 0002', 'manager'),
  ('00000000-0000-0000-0000-000000000003', 'Ricardo Dela Cruz', 'landlord@propmanage.com', '+63 912 000 0003', 'landlord'),
  ('00000000-0000-0000-0000-000000000004', 'Andrea Reyes',      'tenant1@propmanage.com',  '+63 912 000 0004', 'tenant'),
  ('00000000-0000-0000-0000-000000000005', 'Mark Villanueva',   'tenant2@propmanage.com',  '+63 912 000 0005', 'tenant'),
  ('00000000-0000-0000-0000-000000000006', 'Sophia Lim',        'tenant3@propmanage.com',  '+63 912 000 0006', 'tenant')
on conflict (id) do update
set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role;

-- ============================================================
-- PROPERTIES
-- ============================================================
insert into properties (id, name, address, type, description, owner_id, status) values
  (
    'a0000000-0000-0000-0000-000000000001',
    'Sunshine Residences',
    '123 Macapagal Ave, Pasay City, Metro Manila',
    'Apartment',
    'A modern mid-rise residential building with 24/7 security, parking, and amenities.',
    '00000000-0000-0000-0000-000000000003',
    'active'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Green Valley Townhomes',
    '456 Aguinaldo Hwy, Cavite City, Cavite',
    'Townhouse',
    'A peaceful townhouse complex surrounded by greenery, ideal for families.',
    '00000000-0000-0000-0000-000000000003',
    'active'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Ortigas Business Suites',
    '789 Ortigas Ave, Pasig City, Metro Manila',
    'Commercial',
    'Premium commercial units perfect for offices and retail businesses.',
    '00000000-0000-0000-0000-000000000003',
    'maintenance'
  );

-- ============================================================
-- UNITS
-- ============================================================
insert into units (id, property_id, unit_number, bedrooms, bathrooms, rent_amount, status) values
  -- Sunshine Residences units
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '101', 1, 1,   8000.00, 'occupied'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '102', 2, 1,  12000.00, 'occupied'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '103', 1, 1,   8500.00, 'available'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '201', 3, 2,  18000.00, 'available'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '202', 2, 1,  13000.00, 'maintenance'),
  -- Green Valley Townhomes units
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'TH-01', 3, 2, 22000.00, 'occupied'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'TH-02', 3, 2, 22000.00, 'available'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'TH-03', 4, 3, 28000.00, 'available'),
  -- Ortigas Business Suites units
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'GF-01', 0, 1, 35000.00, 'maintenance'),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'GF-02', 0, 1, 35000.00, 'available');

-- ============================================================
-- TENANTS
-- ============================================================
insert into tenants (id, profile_id, full_name, email, phone, emergency_contact, property_id, unit_id) values
  (
    'c0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'Andrea Reyes',
    'tenant1@propmanage.com',
    '+63 912 000 0004',
    'Juan Reyes - +63 912 111 0004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005',
    'Mark Villanueva',
    'tenant2@propmanage.com',
    '+63 912 000 0005',
    'Ana Villanueva - +63 912 111 0005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000006',
    'Sophia Lim',
    'tenant3@propmanage.com',
    '+63 912 000 0006',
    'Henry Lim - +63 912 111 0006',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006'
  );

-- ============================================================
-- LEASES
-- ============================================================
insert into leases (id, tenant_id, property_id, unit_id, start_date, end_date, rent_amount, deposit_amount, status) values
  (
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '2025-01-01', '2026-01-01',
    8000.00, 16000.00,
    'active'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    '2025-03-01', '2026-03-01',
    12000.00, 24000.00,
    'active'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    '2024-06-01', '2025-06-01',
    22000.00, 44000.00,
    'expired'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    '2025-06-01', '2026-06-01',
    22000.00, 44000.00,
    'upcoming'
  );

-- ============================================================
-- PAYMENTS
-- ============================================================
insert into payments (id, tenant_id, property_id, lease_id, amount_due, amount_paid, due_date, paid_at, status) values
  -- Andrea Reyes payments
  (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    8000.00, 8000.00, '2025-01-05', '2025-01-04', 'paid'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    8000.00, 8000.00, '2025-02-05', '2025-02-03', 'paid'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    8000.00, 8000.00, '2025-03-05', '2025-03-05', 'paid'
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    8000.00, 5000.00, '2025-04-05', null, 'partial'
  ),
  (
    'e0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    8000.00, 0.00, '2025-05-05', null, 'overdue'
  ),
  -- Mark Villanueva payments
  (
    'e0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    12000.00, 12000.00, '2025-03-05', '2025-03-04', 'paid'
  ),
  (
    'e0000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    12000.00, 12000.00, '2025-04-05', '2025-04-05', 'paid'
  ),
  (
    'e0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    12000.00, 0.00, '2025-05-05', null, 'pending'
  ),
  -- Sophia Lim payments
  (
    'e0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    22000.00, 22000.00, '2025-01-05', '2025-01-04', 'paid'
  ),
  (
    'e0000000-0000-0000-0000-000000000010',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    22000.00, 0.00, '2025-05-05', null, 'overdue'
  );

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
insert into maintenance_requests (id, title, description, priority, status, property_id, unit_id, tenant_id) values
  (
    'f0000000-0000-0000-0000-000000000001',
    'Leaking faucet in bathroom',
    'The bathroom faucet has been dripping water continuously for the past 3 days.',
    'medium', 'open',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'Air conditioning not cooling',
    'The AC unit in the living room is running but not producing cold air.',
    'high', 'in_progress',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'Broken window latch',
    'The window latch in the bedroom is broken and cannot be locked properly.',
    'low', 'completed',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'Electrical outlet not working',
    'Two electrical outlets in the kitchen have stopped working suddenly.',
    'urgent', 'open',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000003'
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'Water heater malfunction',
    'The water heater is producing lukewarm water instead of hot water.',
    'medium', 'open',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000003'
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'Pest infestation in unit 202',
    'Cockroaches spotted in the kitchen and bathroom area.',
    'high', 'cancelled',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    null
  );

-- ============================================================
-- MAINTENANCE IMAGES
-- ============================================================
insert into maintenance_images (request_id, image_url) values
  ('f0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x600?text=Leaking+Faucet+1'),
  ('f0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x600?text=Leaking+Faucet+2'),
  ('f0000000-0000-0000-0000-000000000002', 'https://placehold.co/800x600?text=AC+Unit'),
  ('f0000000-0000-0000-0000-000000000004', 'https://placehold.co/800x600?text=Electrical+Outlet'),
  ('f0000000-0000-0000-0000-000000000005', 'https://placehold.co/800x600?text=Water+Heater');
