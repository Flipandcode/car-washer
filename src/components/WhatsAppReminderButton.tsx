"use client";

import { MessageCircle } from "lucide-react";
import { buildReminderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Payment, Profile, Vehicle } from "@/lib/types";

interface Props {
  customerName: string;
  flatNumber: string;
  whatsappNumber: string;
  vehicle: Vehicle;
  payment: Payment;
  profile: Pick<Profile, "reminder_template" | "currency_symbol">;
  full?: boolean;
}

export default function WhatsAppReminderButton({
  customerName,
  flatNumber,
  whatsappNumber,
  vehicle,
  payment,
  profile,
  full,
}: Props) {
  function handleClick() {
    const message = buildReminderMessage({ customerName, flatNumber, vehicle, payment, profile });
    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary-300 bg-primary-50 px-3 py-2.5 text-sm font-semibold text-primary-700 active:scale-[0.98] ${
        full ? "w-full" : ""
      }`}
    >
      <MessageCircle size={17} />
      WhatsApp Reminder
    </button>
  );
}
