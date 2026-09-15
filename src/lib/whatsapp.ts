import { normalizePhoneForWhatsApp } from "./utils";
import type { Payment, Profile, Vehicle } from "./types";

interface ReminderContext {
  customerName: string;
  flatNumber: string;
  vehicle: Vehicle;
  payment: Payment;
  profile: Pick<Profile, "reminder_template" | "currency_symbol">;
}

export function buildReminderMessage({ customerName, flatNumber, vehicle, payment, profile }: ReminderContext): string {
  const monthLabel = new Date(payment.billing_month + "T00:00:00").toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const amountDue = (payment.amount_due - payment.amount_paid).toFixed(0);

  return profile.reminder_template
    .replaceAll("{{customer_name}}", customerName)
    .replaceAll("{{flat_number}}", flatNumber)
    .replaceAll("{{vehicle_number}}", vehicle.vehicle_number)
    .replaceAll("{{vehicle_type}}", vehicle.vehicle_type)
    .replaceAll("{{amount_due}}", amountDue)
    .replaceAll("{{billing_month}}", monthLabel);
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}
