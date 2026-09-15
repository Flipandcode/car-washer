import { createClient } from "@/lib/supabase/server";
import { currentMonthStart } from "@/lib/utils";
import type { Customer, Payment, Profile, Vehicle } from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as Profile;

  // Fall back to creating the profile row if the signup trigger didn't run
  // (e.g. the user was created before the migration was applied).
  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: user.id })
    .select("*")
    .maybeSingle();
  return (created as Profile) ?? null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  activeVehicles: number;
  pendingCount: number;
  expected: number;
  collected: number;
  pending: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const empty: DashboardStats = {
    totalCustomers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    pendingCount: 0,
    expected: 0,
    collected: 0,
    pending: 0,
  };
  if (!userId) return empty;

  await supabase.rpc("generate_current_month_payments");

  const month = currentMonthStart();

  const [{ count: totalCustomers }, { count: totalVehicles }, { count: activeVehicles }, { data: payments }] =
    await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("owner_id", userId).eq("is_active", true),
      supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("owner_id", userId).eq("is_active", true),
      supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("is_active", true)
        .eq("subscription_status", "ACTIVE"),
      supabase.from("payments").select("amount_due, amount_paid, status").eq("owner_id", userId).eq("billing_month", month),
    ]);

  let expected = 0;
  let collected = 0;
  let pendingCount = 0;
  for (const p of payments ?? []) {
    expected += Number(p.amount_due);
    collected += Number(p.amount_paid);
    if (p.status === "PENDING" || p.status === "PARTIAL") pendingCount += 1;
  }

  return {
    totalCustomers: totalCustomers ?? 0,
    totalVehicles: totalVehicles ?? 0,
    activeVehicles: activeVehicles ?? 0,
    pendingCount,
    expected,
    collected,
    pending: expected - collected,
  };
}

export interface CustomerListItem extends Customer {
  vehicleCount: number;
  pendingAmount: number;
  overallStatus: "PAID" | "PENDING" | "PARTIALLY PAID" | "NO VEHICLES";
}

export async function getCustomerList(filters?: {
  search?: string;
  isActive?: boolean; // true = active only, false = inactive only, undefined = all
  societyId?: string;
}): Promise<CustomerListItem[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const month = currentMonthStart();

  let query = supabase
    .from("customers")
    .select("*, societies(id, name, address)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (filters?.isActive === true) query = query.eq("is_active", true);
  if (filters?.isActive === false) query = query.eq("is_active", false);
  if (filters?.societyId) query = query.eq("society_id", filters.societyId);
  if (filters?.search) {
    const s = filters.search.trim().replace(/[,()]/g, "");
    // Searching a vehicle number should surface its owner, so resolve any
    // matching vehicles to customer IDs and fold them into the same filter.
    const { data: matchingVehicles } = await supabase
      .from("vehicles")
      .select("customer_id")
      .eq("owner_id", userId)
      .ilike("vehicle_number", `%${s}%`);

    const ids = Array.from(new Set((matchingVehicles ?? []).map((v) => v.customer_id)));
    const clauses = [`name.ilike.%${s}%`, `flat_number.ilike.%${s}%`, `whatsapp_number.ilike.%${s}%`];
    if (ids.length > 0) clauses.push(`id.in.(${ids.join(",")})`);
    query = query.or(clauses.join(","));
  }

  const { data: customers } = await query;
  if (!customers || customers.length === 0) return [];

  const customerIds = customers.map((c) => c.id);

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, customer_id")
    .in("customer_id", customerIds)
    .eq("is_active", true);

  const { data: payments } = await supabase
    .from("payments")
    .select("customer_id, amount_due, amount_paid, status")
    .in("customer_id", customerIds)
    .eq("billing_month", month);

  return customers.map((c) => {
    const vehicleCount = vehicles?.filter((v) => v.customer_id === c.id).length ?? 0;
    const customerPayments = payments?.filter((p) => p.customer_id === c.id) ?? [];
    const pendingAmount = customerPayments.reduce(
      (sum, p) => sum + Math.max(Number(p.amount_due) - Number(p.amount_paid), 0),
      0
    );
    let overallStatus: CustomerListItem["overallStatus"] = "NO VEHICLES";
    if (customerPayments.length > 0) {
      const allPaid = customerPayments.every((p) => p.status === "PAID" || p.status === "WAIVED");
      const allPending = customerPayments.every((p) => p.status === "PENDING");
      overallStatus = allPaid ? "PAID" : allPending ? "PENDING" : "PARTIALLY PAID";
    }
    return { ...(c as Customer), vehicleCount, pendingAmount, overallStatus } as CustomerListItem;
  });
}

export async function getCustomerDetail(customerId: string) {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const month = currentMonthStart();

  const { data: customer } = await supabase
    .from("customers")
    .select("*, societies(id, name, address)")
    .eq("id", customerId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!customer) return null;

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("customer_id", customerId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const vehicleIds = (vehicles ?? []).map((v) => v.id);

  let currentPayments: Payment[] = [];
  if (vehicleIds.length > 0) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .eq("billing_month", month);
    currentPayments = (data as Payment[]) ?? [];
  }

  const vehiclesWithPayment = (vehicles ?? []).map((v) => ({
    ...(v as Vehicle),
    currentPayment: currentPayments.find((p) => p.vehicle_id === v.id) ?? null,
  }));

  return { customer: customer as Customer, vehicles: vehiclesWithPayment };
}

export async function getPaymentHistory(vehicleId: string): Promise<Payment[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("owner_id", userId)
    .order("billing_month", { ascending: false });
  return (data as Payment[]) ?? [];
}

export interface PendingItem {
  payment: Payment;
  customer: Customer;
  vehicle: Vehicle;
}

export async function getPendingPayments(): Promise<PendingItem[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  await supabase.rpc("generate_current_month_payments");
  const month = currentMonthStart();

  const { data } = await supabase
    .from("payments")
    .select("*, customers(*), vehicles(*)")
    .eq("owner_id", userId)
    .eq("billing_month", month)
    .in("status", ["PENDING", "PARTIAL"])
    .order("created_at", { ascending: true });

  return (data ?? [])
    .filter((row: any) => row.customers && row.vehicles)
    .map((row: any) => ({
      payment: row as Payment,
      customer: row.customers as Customer,
      vehicle: row.vehicles as Vehicle,
    }));
}

export interface MonthlyReport {
  activeVehicles: number;
  expected: number;
  collected: number;
  pending: number;
  collectionRate: number;
  paidItems: { customer: Customer; vehicle: Vehicle; payment: Payment }[];
  pendingItems: { customer: Customer; vehicle: Vehicle; payment: Payment }[];
}

export async function getMonthlyReport(billingMonth: string): Promise<MonthlyReport> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const empty: MonthlyReport = {
    activeVehicles: 0,
    expected: 0,
    collected: 0,
    pending: 0,
    collectionRate: 0,
    paidItems: [],
    pendingItems: [],
  };
  if (!userId) return empty;

  const { data } = await supabase
    .from("payments")
    .select("*, customers(*), vehicles(*)")
    .eq("owner_id", userId)
    .eq("billing_month", billingMonth);

  const rows = (data ?? []).filter((r: any) => r.customers && r.vehicles);

  let expected = 0;
  let collected = 0;
  const paidItems: MonthlyReport["paidItems"] = [];
  const pendingItems: MonthlyReport["pendingItems"] = [];

  for (const row of rows as any[]) {
    expected += Number(row.amount_due);
    collected += Number(row.amount_paid);
    const item = { customer: row.customers as Customer, vehicle: row.vehicles as Vehicle, payment: row as Payment };
    if (row.status === "PAID" || row.status === "WAIVED") paidItems.push(item);
    else pendingItems.push(item);
  }

  return {
    activeVehicles: rows.length,
    expected,
    collected,
    pending: expected - collected,
    collectionRate: expected > 0 ? Math.round((collected / expected) * 1000) / 10 : 0,
    paidItems,
    pendingItems,
  };
}

export async function getSocieties() {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data } = await supabase.from("societies").select("*").eq("owner_id", userId).order("name");
  return data ?? [];
}
