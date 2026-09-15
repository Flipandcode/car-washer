import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getCustomerDetail, getPaymentHistory, getProfile } from "@/lib/queries";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

export default async function VehicleHistoryPage({ params }: { params: { id: string; vehicleId: string } }) {
  const [detail, history, profile] = await Promise.all([
    getCustomerDetail(params.id),
    getPaymentHistory(params.vehicleId),
    getProfile(),
  ]);

  if (!detail) notFound();
  const vehicle = detail.vehicles.find((v) => v.id === params.vehicleId);
  if (!vehicle) notFound();

  const currencySymbol = profile?.currency_symbol ?? "₹";

  return (
    <div>
      <PageHeader title={vehicle.vehicle_number} subtitle={`Payment history · ${detail.customer.name}`} backHref={`/customers/${params.id}`} />

      <div className="space-y-2.5 px-4 pb-6">
        {history.length === 0 ? (
          <EmptyState emoji="🧾" title="No payment history yet" />
        ) : (
          history.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-bold">{formatMonth(p.billing_month)}</p>
                <p className="text-xs text-ink/50">
                  {p.payment_date ? `Paid ${formatDate(p.payment_date)}` : "Not yet paid"}
                  {p.payment_method ? ` · ${p.payment_method}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold">{formatCurrency(p.amount_due, currencySymbol)}</p>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
