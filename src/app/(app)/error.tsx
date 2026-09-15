"use client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <p className="text-4xl">⚠️</p>
      <p className="font-semibold">Couldn't load this page.</p>
      <p className="text-sm text-ink/50">Please try again.</p>
      <button onClick={reset} className="btn-primary">
        Try Again
      </button>
    </div>
  );
}
