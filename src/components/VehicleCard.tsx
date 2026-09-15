"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Car, PauseCircle, PlayCircle, Trash2, Pencil, Loader2, History } from "lucide-react";
import StatusBadge from "./StatusBadge";
import MarkPaidModal from "./MarkPaidModal";
import WhatsAppReminderButton from "./WhatsAppReminderButton";
import EditVehicleModal from "./EditVehicleModal";
import { setVehicleSubscriptionStatus, softDeleteVehicle } from "@/lib/actions/vehicles";
import { formatCurrency } from "@/lib/utils";
import type { Customer, Payment, Profile, Vehicle } from "@/lib/types";

interface Props {
  vehicle: Vehicle & { currentPayment?: Payment | null };
  customer: Customer;
  profile: Pick<Profile, "reminder_template" | "currency_symbol" | "default_payment_method">;
}

export default function VehicleCard({ vehicle, customer, profile }: Props) {
  const [showPaid, setShowPaid] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const payment = vehicle.currentPayment;
  const isPendingPayment = payment && (payment.status === "PENDING" || payment.status === "PARTIAL");
  const stopped = vehicle.subscription_status === "STOPPED" || vehicle.subscription_status === "CANCELLED";

  function handleStopResume() {
    startTransition(async () => {
      await setVehicleSubscriptionStatus(vehicle.id, customer.id, stopped ? "ACTIVE" : "STOPPED");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await softDeleteVehicle(vehicle.id, customer.id);
    });
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-xl bg-primary-50 p-2 text-primary-600">
            <Car size={18} />
          </div>
          <div>
            <p className="font-display text-base font-bold tracking-wide">{vehicle.vehicle_number}</p>
            <p className="text-sm text-ink/60">
              {vehicle.vehicle_type} · {formatCurrency(vehicle.monthly_price, profile.currency_symbol)}/month
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={vehicle.subscription_status} />
          {payment && <StatusBadge status={payment.status} />}
        </div>
      </div>

      {isPendingPayment && payment && (
        <div className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-status-pending">
          Payment pending · Service may be stopped if not received.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {isPendingPayment && payment ? (
          <button onClick={() => setShowPaid(true)} className="btn-primary col-span-2 !py-2.5 text-sm">
            Mark Paid
          </button>
        ) : (
          <div className="col-span-2 rounded-xl bg-primary-50 px-3 py-2.5 text-center text-sm font-semibold text-primary-700">
            {payment?.status === "WAIVED" ? "Waived for this month" : "This month is paid ✓"}
          </div>
        )}

        {payment && (
          <WhatsAppReminderButton
            customerName={customer.name}
            flatNumber={customer.flat_number}
            whatsappNumber={customer.whatsapp_number}
            vehicle={vehicle}
            payment={payment}
            profile={profile}
            full
          />
        )}

        <button
          onClick={handleStopResume}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-ink/70 active:scale-[0.98]"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : stopped ? (
            <PlayCircle size={16} />
          ) : (
            <PauseCircle size={16} />
          )}
          {stopped ? "Resume Washing" : "Stop Washing"}
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2.5">
        <Link href={`/customers/${customer.id}/vehicles/${vehicle.id}`} className="btn-ghost !px-2 text-xs">
          <History size={14} /> History
        </Link>
        <button onClick={() => setShowEdit(true)} className="btn-ghost !px-2 text-xs">
          <Pencil size={14} /> Edit
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-ink/60">Remove vehicle?</span>
            <button onClick={handleDelete} className="font-semibold text-status-pending">
              Yes
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-ink/50">
              No
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="btn-ghost !px-2 text-xs text-status-pending">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {showPaid && payment && (
        <MarkPaidModal
          paymentId={payment.id}
          customerId={customer.id}
          amountDue={payment.amount_due}
          amountAlreadyPaid={payment.amount_paid}
          currencySymbol={profile.currency_symbol}
          defaultMethod={profile.default_payment_method}
          onClose={() => setShowPaid(false)}
        />
      )}

      {showEdit && (
        <EditVehicleModal
          vehicle={vehicle}
          customerId={customer.id}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
