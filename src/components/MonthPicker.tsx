"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonth, toDateString } from "@/lib/utils";

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  return toDateString(new Date(y, m - 1 + delta, 1));
}

export default function MonthPicker({ selectedMonth }: { selectedMonth: string }) {
  const router = useRouter();

  function go(delta: number) {
    router.push(`/reports?month=${shiftMonth(selectedMonth, delta)}`);
  }

  return (
    <div className="card flex items-center justify-between !py-2.5">
      <button onClick={() => go(-1)} className="rounded-full p-1.5 active:bg-slate-100">
        <ChevronLeft size={20} />
      </button>
      <span className="font-display text-sm font-bold">{formatMonth(selectedMonth)}</span>
      <button onClick={() => go(1)} className="rounded-full p-1.5 active:bg-slate-100">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
