export default function Loading() {
  return (
    <div className="space-y-3 px-4 pt-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-20 animate-pulse bg-slate-100" />
      ))}
    </div>
  );
}
