export type UserRole =
  | "admin"
  | "manager"
  | "landlord"
  | "tenant"
  | "choose role";

export type PropertyStatus = "active" | "inactive" | "maintenance";
export type UnitStatus = "available" | "occupied" | "maintenance";
export type LeaseStatus = "active" | "expired" | "upcoming";
export type PaymentStatus = "paid" | "pending" | "overdue" | "partial";
export type MaintenanceStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled";
export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  created_at: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  description?: string | null;
  owner_id?: string | null;
  image_url?: string | null;
  status: PropertyStatus;
  created_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  status: UnitStatus;
  created_at: string;
}

export interface Tenant {
  id: string;
  profile_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  emergency_contact?: string | null;
  property_id?: string | null;
  unit_id?: string | null;
  created_at: string;
}

export interface Lease {
  id: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  document_url?: string | null;
  status: LeaseStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  property_id: string;
  lease_id?: string | null;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  paid_at?: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  property_id: string;
  unit_id?: string | null;
  tenant_id?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  occupancyRate: number;
  rentCollected: number;
  unpaidRent: number;
  openMaintenance: number;
}

export interface DashboardPayload {
  metrics: DashboardMetrics;
  revenue: Array<{ month: string; collected: number; unpaid: number }>;
  occupancy: Array<{ label: string; value: number }>;
  maintenance: Array<{ status: MaintenanceStatus; count: number }>;
  recentActivity: Array<{
    id: string;
    label: string;
    timestamp: string;
    type: string;
  }>;
}
