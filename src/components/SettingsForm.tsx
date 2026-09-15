"use client";

import { useState } from "react";
import { Loader2, LogOut, CheckCircle2 } from "lucide-react";
import { updateSettings, signOut } from "@/lib/actions/settings";
import type { PaymentMethod, Profile } from "@/lib/types";

const METHODS: PaymentMethod[] = ["Cash", "UPI", "Bank Transfer", "Other"];

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [businessName, setBusinessName] = useState(profile.business_name);
  const [name, setName] = useState(profile.name);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp_number ?? "");
  const [reminderTemplate, setReminderTemplate] = useState(profile.reminder_template);
  const [warningMessage, setWarningMessage] = useState(profile.payment_warning_message);
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod>(profile.default_payment_method);
  const [currency, setCurrency] = useState(profile.currency_symbol);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setLoading(true);
    setSaved(false);
    const res = await updateSettings({
      business_name: businessName,
      name,
      whatsapp_number: whatsapp,
      reminder_template: reminderTemplate,
      payment_warning_message: warningMessage,
      default_payment_method: defaultMethod,
      currency_symbol: currency,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      <section className="card space-y-3.5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">Business</h2>
        <div>
          <label className="label-text">Business name</label>
          <input className="input-field" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div>
          <label className="label-text">Your name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label-text">Your WhatsApp number</label>
          <input className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text">Currency symbol</label>
            <input className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div>
            <label className="label-text">Default payment method</label>
            <select className="input-field" value={defaultMethod} onChange={(e) => setDefaultMethod(e.target.value as PaymentMethod)}>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-3.5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">WhatsApp Reminder Template</h2>
        <p className="text-xs text-ink/50">
          Use {"{{customer_name}}"}, {"{{flat_number}}"}, {"{{vehicle_number}}"}, {"{{vehicle_type}}"}, {"{{amount_due}}"}, {"{{billing_month}}"}
        </p>
        <textarea
          className="input-field"
          rows={8}
          value={reminderTemplate}
          onChange={(e) => setReminderTemplate(e.target.value)}
        />
      </section>

      <section className="card space-y-3.5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">Payment Warning</h2>
        <textarea className="input-field" rows={3} value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} />
      </section>

      {error && <p className="px-1 text-sm font-medium text-status-pending">{error}</p>}

      <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="animate-spin" size={20} /> : saved ? <CheckCircle2 size={20} /> : "Save Settings"}
      </button>

      <form action={signOut}>
        <button type="submit" className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-status-pending">
          <LogOut size={16} /> Log out
        </button>
      </form>
    </div>
  );
}
