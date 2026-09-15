"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/lib/types";

export async function markPaymentPaid(input: {
  paymentId: string;
  customerId: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: payment, error: fetchErr } = await supabase
    .from("payments")
    .select("amount_due")
    .eq("id", input.paymentId)
    .eq("owner_id", user.id)
    .single();

  if (fetchErr || !payment) return { error: "Payment record not found." };

  if (input.amountPaid <= 0) return { error: "Enter an amount greater than zero." };

  const status = input.amountPaid >= payment.amount_due ? "PAID" : "PARTIAL";

  const { error } = await supabase
    .from("payments")
    .update({
      amount_paid: input.amountPaid,
      payment_method: input.paymentMethod,
      payment_date: input.paymentDate,
      status,
      notes: input.notes?.trim() || null,
    })
    .eq("id", input.paymentId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't record the payment. Please try again." };

  revalidatePath("/dashboard");
  revalidatePath("/pending");
  revalidatePath(`/customers/${input.customerId}`);
  revalidatePath("/reports");
  return { success: true };
}

export async function waivePayment(paymentId: string, customerId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("payments")
    .update({ status: "WAIVED" })
    .eq("id", paymentId)
    .eq("owner_id", user.id);

  if (error) return { error: "Couldn't waive this payment." };

  revalidatePath("/dashboard");
  revalidatePath("/pending");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function ensureCurrentMonthPayments() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.rpc("generate_current_month_payments");
  revalidatePath("/dashboard");
  revalidatePath("/pending");
  return { success: true };
}
