import Link from "next/link";
import { AlertTriangle, Users, Car, UserPlus, ArrowRight, ClipboardList, IndianRupee } from "lucide-react";
import { getDashboardStats, getProfile } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const [stats, profile] = await Promise.all([getDashboardStats(), getProfile()]);
  const currencySymbol = profile?.currency_symbol ?? "₹";
  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="px-4 pb-6 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <div className="mb-5">
        <p className="text-sm text-ink/50">{greeting()} 👋</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{profile?.business_name ?? "My Car Wash"}</h1>
        <p className="text-sm text-ink/50">{monthLabel}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard icon={<Users size={18} />} label="Customers" value={String(stats.totalCustomers)} />
        <StatCard icon={<Car size={18} />} label="Total Vehicles" value={String(stats.totalVehicles)} />
        <StatCard icon={<Car size={18} />} label="Active Vehicles" value={String(stats.activeVehicles)} />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Payments Pending"
          value={String(stats.pendingCount)}
          accent={stats.pendingCount > 0}
        />
      </div>

      <div className="card mb-4 space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">This Month</h2>
        <Row label="Expected" value={formatCurrency(stats.expected, currencySymbol)} />
        <Row label="Collected" value={formatCurrency(stats.collected, currencySymbol)} tone="good" />
        <Row label="Pending" value={formatCurrency(stats.pending, currencySymbol)} tone={stats.pending > 0 ? "bad" : undefined} />
      </div>

      {stats.pendingCount > 0 && (
        <Link
          href="/pending"
          className="mb-4 flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-status-pending">
            <AlertTriangle size={17} /> {stats.pendingCount} Payments Pending
          </span>
          <ArrowRight size={17} className="text-status-pending" />
        </Link>
      )}

      <h2 className="mb-2 px-1 font-display text-sm font-bold uppercase tracking-wide text-ink/50">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction href="/customers/new" icon={<UserPlus size={18} />} label="Add Customer" />
        <QuickAction href="/pending" icon={<ClipboardList size={18} />} label="Pending Payments" />
        <QuickAction href="/reports" icon={<IndianRupee size={18} />} label="Today's Collection" />
        <QuickAction href="/customers" icon={<Users size={18} />} label="All Customers" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className={`w-fit rounded-xl p-2 ${accent ? "bg-orange-50 text-status-pending" : "bg-primary-50 text-primary-600"}`}>
        {icon}
      </div>
      <div>
        <p className="font-display text-xl font-extrabold">{value}</p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink/60">{label}</span>
      <span
        className={`font-display text-base font-bold ${
          tone === "good" ? "text-primary-600" : tone === "bad" ? "text-status-pending" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="card flex items-center gap-2.5 active:scale-[0.98]">
      <div className="rounded-xl bg-primary-50 p-2 text-primary-600">{icon}</div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
