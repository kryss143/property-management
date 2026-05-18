insert into properties (id, name, address, type, description, image_url, status)
values
  ('11111111-1111-4111-8111-111111111111', 'Maple Heights', '42 Garden Avenue', 'Apartment', 'Six-story mixed-unit building near the business district.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'Harbor Row', '18 Pier Street', 'Townhouse', 'Waterfront rental row with renovated kitchens.', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', 'maintenance')
on conflict (id) do nothing;

insert into units (id, property_id, unit_number, bedrooms, bathrooms, rent_amount, status)
values
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', '2B', 2, 1, 2100, 'occupied'),
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', '5A', 1, 1, 1750, 'available')
on conflict (id) do nothing;

insert into tenants (id, full_name, email, phone, emergency_contact, property_id, unit_id)
values
  ('55555555-5555-4555-8555-555555555555', 'Avery Santos', 'avery@example.com', '555-0134', 'Mia Santos, 555-0199', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333')
on conflict (id) do nothing;

insert into leases (id, tenant_id, property_id, unit_id, start_date, end_date, rent_amount, deposit_amount, status)
values
  ('66666666-6666-4666-8666-666666666666', '55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '2026-01-01', '2026-12-31', 2100, 2100, 'active')
on conflict (id) do nothing;

insert into payments (id, tenant_id, property_id, lease_id, amount_due, amount_paid, due_date, paid_at, status)
values
  ('77777777-7777-4777-8777-777777777777', '55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 2100, 2100, '2026-05-01', '2026-05-02', 'paid'),
  ('88888888-8888-4888-8888-888888888888', '55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666666', 2100, 800, '2026-06-01', null, 'partial')
on conflict (id) do nothing;

insert into maintenance_requests (id, title, description, priority, status, property_id, unit_id, tenant_id)
values
  ('99999999-9999-4999-8999-999999999999', 'Kitchen sink leak', 'Leak under the sink after the shutoff valve.', 'high', 'open', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-555555555555'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Lobby lighting', 'Replace two fixtures near the mail area.', 'medium', 'in_progress', '22222222-2222-4222-8222-222222222222', null, null)
on conflict (id) do nothing;
