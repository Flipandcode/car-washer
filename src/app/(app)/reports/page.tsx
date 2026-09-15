import PageHeader from "@/components/PageHeader";
import MonthPicker from "@/components/MonthPicker";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getMonthlyReport, getProfile } from "@/lib/queries";
import { currentMonthStart, formatCurrency, formatMonth } from "@/lib/utils";

export default async function ReportsPage({ searchParams }: { searchParams: { month?: string } }) {
  const month = searchParams.month ?? currentMonthStart();
  const [report, profile] = await Promise.all([getMonthlyReport(month), getProfile()]);
  const currencySymbol = profile?.currency_symbol ?? "₹";

  return (
    <div>
      <PageHeader title="Reports" subtitle={formatMonth(month)} />

      <div className="space-y-4 px-4 pb-6">
        <MonthPicker selectedMonth={month} />

        <div className="card grid grid-cols-2 gap-4">
          <Metric label="Active Vehicles" value={String(report.activeVehicles)} />
          <Metric label="Collection Rate" value={`${report.collectionRate}%`} />
          <Metric label="Expected" value={formatCurrency(report.expected, currencySymbol)} />
          <Metric label="Collected" value={formatCurrency(report.collected, currencySymbol)} tone="good" />
          <Metric label="Pending" value={formatCurrency(report.pending, currencySymbol)} tone={report.pending > 0 ? "bad" : undefined} />
        </div>

        <section className="space-y-2">
          <h2 className="px-1 font-display text-sm font-bold uppercase tracking-wide text-ink/50">
            Paid ({report.paidItems.length})
          </h2>
          {report.paidItems.length === 0 ? (
            <p className="px-1 text-sm text-ink/40">No payments recorded yet.</p>
          ) : (
            report.paidItems.map((it) => (
              <div key={it.payment.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{it.customer.name}</p>
                  <p className="text-xs text-ink/50">
                    {it.vehicle.vehicle_number} · {it.customer.flat_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold">{formatCurrency(it.payment.amount_paid, currencySymbol)}</p>
                  <StatusBadge status={it.payment.status} />
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-2">
          <h2 className="px-1 font-display text-sm font-bold uppercase tracking-wide text-ink/50">
            Pending ({report.pendingItems.length})
          </h2>
          {report.pendingItems.length === 0 ? (
            <EmptyState emoji="✅" title="All collected for this month" />
          ) : (
            report.pendingItems.map((it) => (
              <div key={it.payment.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{it.customer.name}</p>
                  <p className="text-xs text-ink/50">
                    {it.vehicle.vehicle_number} · {it.customer.flat_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold">
                    {formatCurrency(it.payment.amount_due - it.payment.amount_paid, currencySymbol)}
                  </p>
                  <StatusBadge status={it.payment.status} />
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div>
      <p className="text-xs text-ink/50">{label}</p>
      <p
        className={`font-display text-lg font-extrabold ${
          tone === "good" ? "text-primary-600" : tone === "bad" ? "text-status-pending" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
