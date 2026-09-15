import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import CustomerListCard from "@/components/CustomerListCard";
import EmptyState from "@/components/EmptyState";
import { getCustomerList, getProfile, getSocieties } from "@/lib/queries";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; society?: string };
}) {
  const filter = searchParams.filter ?? "active";
  const isActive = filter === "all" ? undefined : filter === "inactive" ? false : true;
  const [customers, profile, societies] = await Promise.all([
    getCustomerList({ search: searchParams.q, isActive, societyId: searchParams.society }),
    getProfile(),
    getSocieties(),
  ]);

  function withParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const next = { filter: searchParams.filter, q: searchParams.q, society: searchParams.society, ...patch };
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    return `/customers?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} total`} />

      <div className="space-y-3 px-4">
        <Suspense fallback={<div className="input-field h-[50px] animate-pulse bg-slate-100" />}>
          <SearchBar />
        </Suspense>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
            { key: "all", label: "All" },
          ].map((f) => {
            const active = filter === f.key;
            return (
              <Link
                key={f.key}
                href={withParams({ filter: f.key })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 text-ink/60"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {societies.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href={withParams({ society: undefined })}
              className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                !searchParams.society ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 text-ink/50"
              }`}
            >
              All Societies
            </Link>
            {societies.map((s: any) => (
              <Link
                key={s.id}
                href={withParams({ society: s.id })}
                className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  searchParams.society === s.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 text-ink/50"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        )}

        <div className="space-y-2.5 pb-4">
          {customers.length === 0 ? (
            <EmptyState emoji="🚗" title="No customers found" subtitle="Try a different search or add a new customer." />
          ) : (
            customers.map((c) => <CustomerListCard key={c.id} customer={c} currencySymbol={profile?.currency_symbol ?? "₹"} />)
          )}
        </div>
      </div>

      <Link
        href="/customers/new"
        className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary-500 px-5 py-3.5 font-semibold text-white shadow-card active:scale-95"
      >
        <Plus size={20} /> Add Customer
      </Link>
    </div>
  );
}
