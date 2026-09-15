"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <p className="text-4xl">⚠️</p>
        <p className="font-semibold">Something went wrong.</p>
        <p className="text-sm text-ink/50">Please try again. If the problem continues, contact support.</p>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
      </body>
    </html>
  );
}
