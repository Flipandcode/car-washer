"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface VehicleDraft {
  vehicle_number: string;
  vehicle_type: string;
  monthly_price: number;
}

export async function createCustomerWithVehicles(input: {
  name: string;
  flat_number: string;
  society_name?: string;
  whatsapp_number: string;
  alternate_phone?: string;
  notes?: string;
  vehicles: VehicleDraft[];
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!input.name.trim() || !input.flat_number.trim() || !input.whatsapp_number.trim()) {
    return { error: "Name, flat number and WhatsApp number are required." };
  }
  if (input.vehicles.length === 0) {
    return { error: "Add at least one vehicle." };
  }
  for (const v of input.vehicles) {
    if (!v.vehicle_number.trim()) return { error: "Every vehicle needs a vehicle number." };
    if (!v.monthly_price || v.monthly_price <= 0) return { error: "Enter a valid monthly price for every vehicle." };
  }

  let societyId: string | null = null;
  if (input.society_name && input.society_name.trim()) {
    const { data: existing } = await supabase
      .from("societies")
      .select("id")
      .eq("owner_id", user.id)
      .eq("name", input.society_name.trim())
      .maybeSingle();
    if (existing) {
      societyId = existing.id;
    } else {
      const { data: created, error: societyErr } = await supabase
        .from("societies")
        .insert({ owner_id: user.id, name: input.society_name.trim() })
        .select("id")
        .single();
      if (societyErr) return { error: "Couldn't save the society. Try again." };
      societyId = created.id;
    }
  }

  const { data: customer, error: customerErr } = await supabase
    .from("customers")
    .insert({
      owner_id: user.id,
      society_id: societyId,
      name: input.name.trim(),
      flat_number: input.flat_number.trim(),
      whatsapp_number: input.whatsapp_number.trim(),
      alternate_phone: input.alternate_phone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (customerErr) {
    return { error: "Couldn't save this customer. Please try again." };
  }

  const vehiclesPayload = input.vehicles.map((v) => ({
    owner_id: user.id,
    customer_id: customer.id,
    vehicle_number: v.vehicle_number.trim().toUpperCase(),
    vehicle_type: v.vehicle_type,
    monthly_price: v.monthly_price,
  }));

  const { error: vehiclesErr } = await supabase.from("vehicles").insert(vehiclesPayload);
  if (vehiclesErr) {
    const msg = vehiclesErr.message.includes("duplicate")
      ? "One of these vehicle numbers is already registered."
      : "Customer saved, but one or more vehicles could not be added.";
    return { error: msg, customerId: customer.id };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(
  customerId: string,
  input: {
    name: string;
    flat_number: string;
    whatsapp_number: string;
    alternate_phone?: string;
    notes?: string;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("customers")
    .update({
      name: input.name.trim(),
      flat_number: input.flat_number.trim(),
      whatsapp_number: input.whatsapp_number.trim(),
      alternate_phone: input.alternate_phone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("id", customerId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't update the customer." };

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
  return { success: true };
}

export async function toggleCustomerActive(customerId: string, isActive: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("customers")
    .update({ is_active: isActive })
    .eq("id", customerId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't update customer status." };

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function addVehicleToCustomer(
  customerId: string,
  vehicle: VehicleDraft
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!vehicle.vehicle_number.trim()) return { error: "Vehicle number is required." };
  if (!vehicle.monthly_price || vehicle.monthly_price <= 0) return { error: "Enter a valid monthly price." };

  const { error } = await supabase.from("vehicles").insert({
    owner_id: user.id,
    customer_id: customerId,
    vehicle_number: vehicle.vehicle_number.trim().toUpperCase(),
    vehicle_type: vehicle.vehicle_type,
    monthly_price: vehicle.monthly_price,
  });

  if (error) {
    const msg = error.message.includes("duplicate")
      ? "This vehicle number is already registered."
      : "Couldn't add the vehicle.";
    return { error: msg };
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
