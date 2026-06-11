export function SkeletonCard({
  lines = 3,
  className = "",
  compact = false
}: {
  lines?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}>
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
      <div className="mt-5 h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: compact ? Math.min(lines, 2) : lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded-full bg-slate-200"
            style={{ width: `${index === lines - 1 ? 54 : 88 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}
