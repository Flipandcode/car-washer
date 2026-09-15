"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Droplets, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Couldn't sign in. Check your email and password and try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-primary-700 to-primary-500 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Droplets size={30} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">SoapRun</h1>
          <p className="mt-1 text-sm text-white/80">Car wash business, sorted.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-status-pending">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/70">
          Ask your admin to create your account in Supabase if you don't have one yet.
        </p>
      </div>
    </main>
  );
}
