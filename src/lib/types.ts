export type VehicleType = "Hatchback" | "Sedan" | "SUV" | "MUV" | "Premium" | "Other";
export type SubscriptionStatus = "ACTIVE" | "PAYMENT_PENDING" | "STOPPED" | "CANCELLED";
export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "WAIVED";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Other";

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  business_name: string;
  whatsapp_number: string | null;
  reminder_template: string;
  payment_warning_message: string;
  default_payment_method: PaymentMethod;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
}

export interface Society {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  owner_id: string;
  society_id: string | null;
  name: string;
  flat_number: string;
  whatsapp_number: string;
  alternate_phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  societies?: Society | null;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  customer_id: string;
  vehicle_number: string;
  vehicle_type: VehicleType;
  monthly_price: number;
  start_date: string;
  subscription_status: SubscriptionStatus;
  washing_days: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  owner_id: string;
  customer_id: string;
  vehicle_id: string;
  billing_month: string; // yyyy-mm-01
  amount_due: number;
  amount_paid: number;
  payment_date: string | null;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleWithPayment extends Vehicle {
  currentPayment?: Payment | null;
}

export interface CustomerWithVehicles extends Customer {
  vehicles: VehicleWithPayment[];
}

