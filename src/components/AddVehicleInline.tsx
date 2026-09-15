"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { addVehicleToCustomer } from "@/lib/actions/customers";
import type { VehicleType } from "@/lib/types";

const TYPES: VehicleType[] = ["Hatchback", "Sedan", "SUV", "MUV", "Premium", "Other"];

export default function AddVehicleInline({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [type, setType] = useState<VehicleType>("Sedan");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setLoading(true);
    const res = await addVehicleToCustomer(customerId, {
      vehicle_number: number,
      vehicle_type: type,
      monthly_price: Number(price),
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setNumber("");
    setPrice("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full">
        <Plus size={18} /> Add Vehicle
      </button>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">New Vehicle</h3>
        <button onClick={() => setOpen(false)} className="text-ink/40">
          <X size={18} />
        </button>
      </div>
      <input
        className="input-field uppercase"
        placeholder="Vehicle number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <select className="input-field" value={type} onChange={(e) => setType(e.target.value as VehicleType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="number"
          inputMode="decimal"
          className="input-field"
          placeholder="Price ₹"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      {error && <p className="text-sm font-medium text-status-pending">{error}</p>}
      <button onClick={handleAdd} disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Add Vehicle"}
      </button>
    </div>
  );
}
