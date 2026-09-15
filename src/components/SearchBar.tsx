"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useEffect, useTransition } from "react";

export default function SearchBar({ placeholder = "Search name, flat, vehicle number…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-9"
      />
      {value && (
        <button onClick={() => setValue("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
