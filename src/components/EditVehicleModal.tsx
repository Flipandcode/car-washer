"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { updateVehicle } from "@/lib/actions/vehicles";
import type { Vehicle, VehicleType } from "@/lib/types";

const TYPES: VehicleType[] = ["Hatchback", "Sedan", "SUV", "MUV", "Premium", "Other"];

export default function EditVehicleModal({
  vehicle,
  customerId,
  onClose,
}: {
  vehicle: Vehicle;
  customerId: string;
  onClose: () => void;
}) {
  const [vehicleNumber, setVehicleNumber] = useState(vehicle.vehicle_number);
  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicle.vehicle_type);
  const [price, setPrice] = useState(String(vehicle.monthly_price));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setLoading(true);
    const res = await updateVehicle(vehicle.id, customerId, {
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      monthly_price: Number(price),
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
          <h2 className="font-display text-lg font-bold">Edit Vehicle</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/50 active:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-text">Vehicle number</label>
            <input
              className="input-field uppercase"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Vehicle type</label>
            <select className="input-field" value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Monthly price</label>
            <input type="number" inputMode="decimal" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} />
            <p className="mt-1 text-xs text-ink/50">This applies from next month onward. Past payments stay unchanged.</p>
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
