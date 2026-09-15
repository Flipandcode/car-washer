import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formats a Date as yyyy-mm-dd using its LOCAL calendar values.
 * toISOString() must not be used for this: it converts to UTC first, so in
 * IST (UTC+5:30) the 1st of a month becomes the last day of the previous one,
 * which would silently corrupt every billing_month lookup.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** First day of the month the given date falls in, as yyyy-mm-01. */
export function currentMonthStart(date = new Date()): string {
  return toDateString(new Date(date.getFullYear(), date.getMonth(), 1));
}

/** Today, as yyyy-mm-dd in the user's local timezone. */
export function todayString(): string {
  return toDateString(new Date());
}

export function formatMonth(billingMonth: string): string {
  const d = new Date(billingMonth + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatCurrency(amount: number, symbol = "₹"): string {
  return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function normalizePhoneForWhatsApp(phone: string): string {
  // strip everything but digits
  let digits = phone.replace(/\D/g, "");
  // if it's a 10-digit Indian number, prefix country code
  if (digits.length === 10) digits = "91" + digits;
  return digits;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-primary-50 text-primary-700 border-primary-300",
  PENDING: "bg-orange-50 text-status-pending border-orange-200",
  PARTIAL: "bg-amber-50 text-status-partial border-amber-200",
  WAIVED: "bg-slate-50 text-slate-600 border-slate-200",
  ACTIVE: "bg-primary-50 text-primary-700 border-primary-300",
  PAYMENT_PENDING: "bg-orange-50 text-status-pending border-orange-200",
  STOPPED: "bg-slate-100 text-status-stopped border-slate-300",
  CANCELLED: "bg-slate-100 text-status-stopped border-slate-300",
};
