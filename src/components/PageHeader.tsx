import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  backHref,
  right,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 bg-surface/90 px-4 pb-3 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {backHref && (
            <Link href={backHref} className="-ml-1.5 rounded-full p-1.5 text-ink/60 active:bg-slate-100">
              <ChevronLeft size={22} />
            </Link>
          )}
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-ink/50">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}
