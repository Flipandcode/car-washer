import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import PendingItemCard from "@/components/PendingItemCard";
import { getPendingPayments, getProfile } from "@/lib/queries";

export default async function PendingPage() {
  const [items, profile] = await Promise.all([getPendingPayments(), getProfile()]);
  const currencySymbol = profile?.currency_symbol ?? "₹";

  return (
    <div>
      <PageHeader title="Pending Payments" subtitle={`${items.length} ${items.length === 1 ? "customer" : "customers"} awaiting payment`} />

      <div className="space-y-3 px-4 pb-6">
        {items.length === 0 ? (
          <EmptyState emoji="🎉" title="No pending payments" subtitle="Everyone's up to date this month." />
        ) : (
          items.map((item) => (
            <PendingItemCard
              key={item.payment.id}
              item={item}
              currencySymbol={currencySymbol}
              defaultMethod={profile?.default_payment_method ?? "Cash"}
              reminderTemplate={profile?.reminder_template ?? ""}
            />
          ))
        )}
      </div>
    </div>
  );
}
