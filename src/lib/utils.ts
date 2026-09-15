import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function currentMonthStart(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().slice(0, 10);
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
