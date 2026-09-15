import { cn, STATUS_COLORS } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");
  return (
    <span className={cn("badge", STATUS_COLORS[status] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
      {label}
    </span>
  );
}
