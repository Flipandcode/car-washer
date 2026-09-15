import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { CustomerListItem } from "@/lib/queries";

export default function CustomerListCard({ customer, currencySymbol }: { customer: CustomerListItem; currencySymbol: string }) {
  return (
    <Link href={`/customers/${customer.id}`} className="card flex items-center justify-between gap-3 active:scale-[0.99]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-display text-base font-bold">{customer.name}</p>
          {!customer.is_active && <StatusBadge status="STOPPED" />}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-ink/60">
          <MapPin size={13} /> {customer.flat_number}
          {customer.societies?.name ? ` · ${customer.societies.name}` : ""}
        </p>
        <p className="mt-1 text-sm text-ink/70">
          {customer.vehicleCount} {customer.vehicleCount === 1 ? "vehicle" : "vehicles"}
          {customer.pendingAmount > 0 && (
            <span className="font-semibold text-status-pending"> · {formatCurrency(customer.pendingAmount, currencySymbol)} pending</span>
          )}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        {customer.overallStatus !== "NO VEHICLES" && (
          <StatusBadge status={customer.overallStatus === "PARTIALLY PAID" ? "PARTIAL" : customer.overallStatus} />
        )}
        <ChevronRight size={18} className="text-ink/30" />
      </div>
    </Link>
  );
}
