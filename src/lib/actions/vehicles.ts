"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateVehicle(
  vehicleId: string,
  customerId: string,
  input: { vehicle_number: string; vehicle_type: string; monthly_price: number; washing_days?: string; notes?: string }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!input.vehicle_number.trim()) return { error: "Vehicle number is required." };
  if (!input.monthly_price || input.monthly_price <= 0) return { error: "Enter a valid monthly price." };

  const { error } = await supabase
    .from("vehicles")
    .update({
      vehicle_number: input.vehicle_number.trim().toUpperCase(),
      vehicle_type: input.vehicle_type,
      monthly_price: input.monthly_price,
      washing_days: input.washing_days?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("id", vehicleId)
    .eq("owner_id", user.id);

  if (error) {
    const msg = error.message.includes("duplicate") ? "This vehicle number is already registered." : "Couldn't update the vehicle.";
    return { error: msg };
  }

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function softDeleteVehicle(vehicleId: string, customerId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vehicles")
    .update({ is_active: false, subscription_status: "CANCELLED" })
    .eq("id", vehicleId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't remove the vehicle." };

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setVehicleSubscriptionStatus(
  vehicleId: string,
  customerId: string,
  status: "STOPPED" | "ACTIVE"
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vehicles")
    .update({ subscription_status: status })
    .eq("id", vehicleId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't update the subscription." };

  if (status === "ACTIVE") {
    await supabase.rpc("generate_current_month_payments");
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  revalidatePath("/pending");
  return { success: true };
}
