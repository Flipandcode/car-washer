import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-4xl">🔍</p>
      <p className="font-semibold">Not found</p>
      <p className="text-sm text-ink/50">This page doesn't exist.</p>
      <Link href="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
