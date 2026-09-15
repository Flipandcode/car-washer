"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, AlertCircle, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/pending", label: "Pending", icon: AlertCircle },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-200 bg-white/95 backdrop-blur">
      <ul className="flex items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                  active ? "text-primary-600" : "text-ink/40"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
