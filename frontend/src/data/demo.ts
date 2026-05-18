import type {
  DashboardPayload,
  Lease,
  MaintenanceRequest,
  Payment,
  Property,
  Tenant,
  Unit
} from "@property-management/shared";

const now = new Date().toISOString();

export const demoProperties: Property[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Maple Heights",
    address: "42 Garden Avenue",
    type: "Apartment",
    description: "Six-story mixed-unit building near the business district.",
    owner_id: null,
    image_url:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    created_at: now
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Harbor Row",
    address: "18 Pier Street",
    type: "Townhouse",
    description: "Waterfront rental row with renovated kitchens.",
    owner_id: null,
    image_url:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    status: "maintenance",
    created_at: now
  }
];

export const demoUnits: Unit[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    property_id: demoProperties[0].id,
    unit_number: "2B",
    bedrooms: 2,
    bathrooms: 1,
    rent_amount: 2100,
    status: "occupied",
    created_at: now
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    property_id: demoProperties[0].id,
    unit_number: "5A",
    bedrooms: 1,
    bathrooms: 1,
    rent_amount: 1750,
    status: "available",
    created_at: now
  }
];

export const demoTenants: Tenant[] = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    profile_id: null,
    full_name: "Avery Santos",
    email: "avery@example.com",
    phone: "555-0134",
    emergency_contact: "Mia Santos, 555-0199",
    property_id: demoProperties[0].id,
    unit_id: demoUnits[0].id,
    created_at: now
  }
];

export const demoLeases: Lease[] = [
  {
    id: "66666666-6666-4666-8666-666666666666",
    tenant_id: demoTenants[0].id,
    property_id: demoProperties[0].id,
    unit_id: demoUnits[0].id,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    rent_amount: 2100,
    deposit_amount: 2100,
    document_url: null,
    status: "active",
    created_at: now
  }
];

export const demoPayments: Payment[] = [
  {
    id: "77777777-7777-4777-8777-777777777777",
    tenant_id: demoTenants[0].id,
    property_id: demoProperties[0].id,
    lease_id: demoLeases[0].id,
    amount_due: 2100,
    amount_paid: 2100,
    due_date: "2026-05-01",
    paid_at: "2026-05-02",
    status: "paid",
    created_at: now
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    tenant_id: demoTenants[0].id,
    property_id: demoProperties[0].id,
    lease_id: demoLeases[0].id,
    amount_due: 2100,
    amount_paid: 800,
    due_date: "2026-06-01",
    paid_at: null,
    status: "partial",
    created_at: now
  }
];

export const demoMaintenance: MaintenanceRequest[] = [
  {
    id: "99999999-9999-4999-8999-999999999999",
    title: "Kitchen sink leak",
    description: "Leak under the sink after the shutoff valve.",
    priority: "high",
    status: "open",
    property_id: demoProperties[0].id,
    unit_id: demoUnits[0].id,
    tenant_id: demoTenants[0].id,
    created_at: now
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Lobby lighting",
    description: "Replace two fixtures near the mail area.",
    priority: "medium",
    status: "in_progress",
    property_id: demoProperties[1].id,
    unit_id: null,
    tenant_id: null,
    created_at: now
  }
];

export const demoDashboard: DashboardPayload = {
  metrics: {
    totalProperties: 2,
    totalUnits: 2,
    totalTenants: 1,
    occupancyRate: 50,
    rentCollected: 2900,
    unpaidRent: 1300,
    openMaintenance: 2
  },
  revenue: [
    { month: "Jan", collected: 2100, unpaid: 0 },
    { month: "Feb", collected: 2100, unpaid: 0 },
    { month: "Mar", collected: 2100, unpaid: 0 },
    { month: "Apr", collected: 2100, unpaid: 0 },
    { month: "May", collected: 2100, unpaid: 0 },
    { month: "Jun", collected: 800, unpaid: 1300 }
  ],
  occupancy: [
    { label: "Occupied", value: 1 },
    { label: "Available", value: 1 },
    { label: "Maintenance", value: 0 }
  ],
  maintenance: [
    { status: "open", count: 1 },
    { status: "in_progress", count: 1 },
    { status: "completed", count: 0 },
    { status: "cancelled", count: 0 }
  ],
  recentActivity: demoMaintenance.map((request) => ({
    id: request.id,
    label: request.title,
    timestamp: request.created_at,
    type: request.status
  }))
};

export const demoResources: Record<string, unknown[]> = {
  properties: demoProperties,
  units: demoUnits,
  tenants: demoTenants,
  leases: demoLeases,
  payments: demoPayments,
  "maintenance-requests": demoMaintenance
};
