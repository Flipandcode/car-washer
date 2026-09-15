import { notFound } from "next/navigation";
import { Phone, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import VehicleCard from "@/components/VehicleCard";
import AddVehicleInline from "@/components/AddVehicleInline";
import CustomerActions from "@/components/CustomerActions";
import { getCustomerDetail, getProfile } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [detail, profile] = await Promise.all([getCustomerDetail(params.id), getProfile()]);
  if (!detail) notFound();

  const { customer, vehicles } = detail;
  const currencySymbol = profile?.currency_symbol ?? "₹";

  const totalMonthly = vehicles.reduce((s, v) => s + Number(v.monthly_price), 0);
  const paid = vehicles.reduce((s, v) => s + (v.currentPayment ? Number(v.currentPayment.amount_paid) : 0), 0);
  const pending = Math.max(totalMonthly - paid, 0);

  return (
    <div>
      <PageHeader title={customer.name} backHref="/customers" right={<CustomerActions customer={customer} />} />

      <div className="space-y-4 px-4 pb-6">
        <div className="card space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm text-ink/70">
            <MapPin size={14} /> {customer.flat_number}
            {customer.societies?.name ? ` · ${customer.societies.name}` : ""}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-ink/70">
            <Phone size={14} /> {customer.whatsapp_number}
          </p>
          {customer.notes && <p className="pt-1 text-sm text-ink/50">{customer.notes}</p>}
        </div>

        {vehicles.length > 0 && (
          <div className="card grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div>
              <p className="text-xs text-ink/50">Monthly</p>
              <p className="font-display text-sm font-bold">{formatCurrency(totalMonthly, currencySymbol)}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Paid</p>
              <p className="font-display text-sm font-bold text-primary-600">{formatCurrency(paid, currencySymbol)}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50">Pending</p>
              <p className="font-display text-sm font-bold text-status-pending">{formatCurrency(pending, currencySymbol)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">
            Vehicles ({vehicles.length})
          </h2>
        </div>

        <div className="space-y-3">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              customer={customer}
              profile={{
                reminder_template: profile?.reminder_template ?? "",
                currency_symbol: currencySymbol,
                default_payment_method: profile?.default_payment_method ?? "Cash",
              }}
            />
          ))}
        </div>

        <AddVehicleInline customerId={customer.id} />
      </div>
    </div>
  );
}
