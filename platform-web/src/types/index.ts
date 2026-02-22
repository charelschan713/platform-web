export type Role =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'TENANT_STAFF'
  | 'CORPORATE_ADMIN'
  | 'PASSENGER'
  | 'DRIVER';

export interface User {
  id: string;
  email: string;
  role: Role;
  tenant_id: string | null;
  first_name: string;
  last_name: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  commission_rate: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
  vehicle_class: 'BUSINESS' | 'FIRST' | 'VAN' | 'ELECTRIC';
  capacity: number;
  is_active: boolean;
}

export interface Driver {
  id: string;
  user_id: string;
  tenant_id: string;
  license_number: string;
  license_expiry: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  rating: number;
  total_trips: number;
  is_available: boolean;
  profiles: {
    first_name: string;
    last_name: string;
    phone: string;
    avatar_url?: string;
  };
  vehicles: Vehicle[];
}

export interface Booking {
  id: string;
  tenant_id: string;
  passenger_id: string;
  driver_id?: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_datetime: string;
  vehicle_class: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'DRIVER_ASSIGNED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  passenger_count: number;
  total_price: number;
  currency: string;
  flight_number?: string;
  special_requests?: string;
}

export interface PricingRule {
  id: string;
  vehicle_class: string;
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  minimum_fare: number;
  currency: string;
  is_active: boolean;
}

export interface ApiKeysStatus {
  stripe: boolean;
  resend: boolean;
  twilio: boolean;
}

export interface DashboardStats {
  bookings: {
    total: number;
    by_status: Record<string, number>;
  };
  drivers: {
    total: number;
    by_status: Record<string, number>;
  };
  total_revenue: number;
}

export interface TenantBrand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  domain?: string;
}
