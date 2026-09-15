"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { markPaymentPaid } from "@/lib/actions/payments";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

const METHODS: PaymentMethod[] = ["Cash", "UPI", "Bank Transfer", "Other"];

interface Props {
  paymentId: string;
  customerId: string;
  amountDue: number;
  amountAlreadyPaid: number;
  currencySymbol: string;
  defaultMethod: PaymentMethod;
  onClose: () => void;
}

export default function MarkPaidModal({
  paymentId,
  customerId,
  amountDue,
  amountAlreadyPaid,
  currencySymbol,
  defaultMethod,
  onClose,
}: Props) {
  const balanceDue = Math.max(amountDue - amountAlreadyPaid, 0);
  const [amount, setAmount] = useState(String(balanceDue || amountDue));
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    setError(null);
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setLoading(true);
    const res = await markPaymentPaid({
      paymentId,
      customerId,
      amountPaid: amountAlreadyPaid + amountNum,
      paymentMethod: method,
      paymentDate: date,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setDone(true);
    setTimeout(onClose, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="text-primary-500" size={48} />
            <p className="font-display text-lg font-bold">Payment recorded</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Mark Paid</h2>
              <button onClick={onClose} className="rounded-full p-1.5 text-ink/50 active:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-ink/60">
              Amount due: <span className="font-semibold text-ink">{formatCurrency(balanceDue, currencySymbol)}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="label-text">Amount received</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="input-field"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="label-text">Payment method</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
                        method === m ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 text-ink/70"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Payment date</label>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              {error && <p className="text-sm font-medium text-status-pending">{error}</p>}

              <button onClick={handleConfirm} disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Payment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
