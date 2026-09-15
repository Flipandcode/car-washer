export default function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-16 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="mt-2 font-display text-base font-bold text-ink/80">{title}</p>
      {subtitle && <p className="text-sm text-ink/50">{subtitle}</p>}
    </div>
  );
}
