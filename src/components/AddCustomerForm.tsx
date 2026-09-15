"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Car } from "lucide-react";
import { createCustomerWithVehicles, type VehicleDraft } from "@/lib/actions/customers";
import type { VehicleType } from "@/lib/types";

const TYPES: VehicleType[] = ["Hatchback", "Sedan", "SUV", "MUV", "Premium", "Other"];

function emptyVehicle(): VehicleDraft {
  return { vehicle_number: "", vehicle_type: "Sedan", monthly_price: 0 };
}

export default function AddCustomerForm() {
  const [name, setName] = useState("");
  const [flat, setFlat] = useState("");
  const [society, setSociety] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [vehicles, setVehicles] = useState<VehicleDraft[]>([emptyVehicle()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateVehicle(idx: number, patch: Partial<VehicleDraft>) {
    setVehicles((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function removeVehicle(idx: number) {
    setVehicles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await createCustomerWithVehicles({
      name,
      flat_number: flat,
      society_name: society,
      whatsapp_number: whatsapp,
      alternate_phone: altPhone,
      vehicles: vehicles.map((v) => ({ ...v, monthly_price: Number(v.monthly_price) })),
    });
    setLoading(false);
    if (res?.error) setError(res.error);
    // on success, the server action redirects
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-8">
      <section className="card space-y-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">Customer details</h2>
        <div>
          <label className="label-text">Customer name</label>
          <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rajesh Sharma" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text">Flat number</label>
            <input required className="input-field" value={flat} onChange={(e) => setFlat(e.target.value)} placeholder="A-102" />
          </div>
          <div>
            <label className="label-text">Society</label>
            <input className="input-field" value={society} onChange={(e) => setSociety(e.target.value)} placeholder="Green Valley" />
          </div>
        </div>
        <div>
          <label className="label-text">WhatsApp number</label>
          <input
            required
            type="tel"
            inputMode="tel"
            className="input-field"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="label-text">Alternate phone (optional)</label>
          <input
            type="tel"
            inputMode="tel"
            className="input-field"
            value={altPhone}
            onChange={(e) => setAltPhone(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">Vehicles</h2>
          <button
            type="button"
            onClick={() => setVehicles((prev) => [...prev, emptyVehicle()])}
            className="flex items-center gap-1 text-sm font-semibold text-primary-600"
          >
            <Plus size={16} /> Add Another Vehicle
          </button>
        </div>

        {vehicles.map((v, idx) => (
          <div key={idx} className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink/60">
                <Car size={15} /> Vehicle {idx + 1}
              </div>
              {vehicles.length > 1 && (
                <button type="button" onClick={() => removeVehicle(idx)} className="text-status-pending">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div>
              <label className="label-text">Vehicle number</label>
              <input
                required
                className="input-field uppercase"
                value={v.vehicle_number}
                onChange={(e) => updateVehicle(idx, { vehicle_number: e.target.value })}
                placeholder="MH04AB1234"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Type</label>
                <select
                  className="input-field"
                  value={v.vehicle_type}
                  onChange={(e) => updateVehicle(idx, { vehicle_type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Monthly price (₹)</label>
                <input
                  required
                  type="number"
                  inputMode="decimal"
                  className="input-field"
                  value={v.monthly_price || ""}
                  onChange={(e) => updateVehicle(idx, { monthly_price: Number(e.target.value) })}
                  placeholder="500"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {error && <p className="px-1 text-sm font-medium text-status-pending">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Customer"}
      </button>
    </form>
  );
}
