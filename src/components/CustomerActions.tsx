"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, UserX, UserCheck, X, Loader2 } from "lucide-react";
import { toggleCustomerActive, updateCustomer } from "@/lib/actions/customers";
import type { Customer } from "@/lib/types";

export default function CustomerActions({ customer }: { customer: Customer }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button onClick={() => setMenuOpen((o) => !o)} className="rounded-full p-1.5 text-ink/60 active:bg-slate-100">
        <MoreVertical size={20} />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-card">
            <button
              onClick={() => {
                setEditOpen(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/80 active:bg-slate-50"
            >
              <Pencil size={16} /> Edit details
            </button>
            <button
              onClick={() => {
                startTransition(() => {
                  void toggleCustomerActive(customer.id, !customer.is_active);
                });
                setMenuOpen(false);
              }}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-status-pending active:bg-slate-50"
            >
              {customer.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
              {customer.is_active ? "Deactivate customer" : "Reactivate customer"}
            </button>
          </div>
        </>
      )}

      {editOpen && <EditCustomerModal customer={customer} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function EditCustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [name, setName] = useState(customer.name);
  const [flat, setFlat] = useState(customer.flat_number);
  const [whatsapp, setWhatsapp] = useState(customer.whatsapp_number);
  const [altPhone, setAltPhone] = useState(customer.alternate_phone ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setLoading(true);
    const res = await updateCustomer(customer.id, {
      name,
      flat_number: flat,
      whatsapp_number: whatsapp,
      alternate_phone: altPhone,
      notes,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Edit Customer</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/50 active:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3.5">
          <div>
            <label className="label-text">Name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label-text">Flat number</label>
            <input className="input-field" value={flat} onChange={(e) => setFlat(e.target.value)} />
          </div>
          <div>
            <label className="label-text">WhatsApp number</label>
            <input className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div>
            <label className="label-text">Alternate phone</label>
            <input className="input-field" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
          </div>
          <div>
            <label className="label-text">Notes</label>
            <textarea className="input-field" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <p className="text-sm font-medium text-status-pending">{error}</p>}
          <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
