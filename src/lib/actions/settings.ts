"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/lib/types";

export async function updateSettings(input: {
  business_name: string;
  name: string;
  whatsapp_number?: string;
  reminder_template: string;
  payment_warning_message: string;
  default_payment_method: PaymentMethod;
  currency_symbol: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      business_name: input.business_name.trim() || "My Car Wash",
      name: input.name.trim() || "Car Washer",
      whatsapp_number: input.whatsapp_number?.trim() || null,
      reminder_template: input.reminder_template,
      payment_warning_message: input.payment_warning_message,
      default_payment_method: input.default_payment_method,
      currency_symbol: input.currency_symbol || "₹",
    })
    .eq("id", user.id);

  if (error) return { error: "Couldn't save settings." };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
