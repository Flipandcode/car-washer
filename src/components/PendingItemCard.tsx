"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import MarkPaidModal from "./MarkPaidModal";
import WhatsAppReminderButton from "./WhatsAppReminderButton";
import { formatCurrency } from "@/lib/utils";
import type { PendingItem } from "@/lib/queries";
import type { PaymentMethod } from "@/lib/types";

export default function PendingItemCard({
  item,
  currencySymbol,
  defaultMethod,
  reminderTemplate,
}: {
  item: PendingItem;
  currencySymbol: string;
  defaultMethod: PaymentMethod;
  reminderTemplate: string;
}) {
  const [showPaid, setShowPaid] = useState(false);
  const { payment, customer, vehicle } = item;
  const balance = payment.amount_due - payment.amount_paid;

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/customers/${customer.id}`} className="font-display text-base font-bold">
            {customer.name}
          </Link>
          <p className="flex items-center gap-1 text-sm text-ink/60">
            <MapPin size={13} /> {customer.flat_number}
          </p>
        </div>
        <span className="badge border-orange-200 bg-orange-50 text-status-pending">PAYMENT PENDING</span>
      </div>

      <div className="rounded-xl bg-surface px-3 py-2.5">
        <p className="font-display text-sm font-bold tracking-wide">{vehicle.vehicle_number}</p>
        <p className="text-sm text-ink/60">
          {vehicle.vehicle_type} · {formatCurrency(balance, currencySymbol)} due
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowPaid(true)} className="btn-primary !py-2.5 text-sm">
          Mark Paid
        </button>
        <WhatsAppReminderButton
          customerName={customer.name}
          flatNumber={customer.flat_number}
          whatsappNumber={customer.whatsapp_number}
          vehicle={vehicle}
          payment={payment}
          profile={{ reminder_template: reminderTemplate, currency_symbol: currencySymbol }}
          full
        />
      </div>

      {showPaid && (
        <MarkPaidModal
          paymentId={payment.id}
          customerId={customer.id}
          amountDue={payment.amount_due}
          amountAlreadyPaid={payment.amount_paid}
          currencySymbol={currencySymbol}
          defaultMethod={defaultMethod}
          onClose={() => setShowPaid(false)}
        />
      )}
    </div>
  );
}
