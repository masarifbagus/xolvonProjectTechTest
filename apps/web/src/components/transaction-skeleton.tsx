export default function TransactionSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="rounded-2xl border border-glass-border bg-surface overflow-hidden">
      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="border-b border-glass-border px-6 py-4 flex items-center">
          <div className="flex-1 grid grid-cols-4 gap-6">
            {["w-20", "w-32", "w-24", "w-16"].map((w, i) => (
              <div
                key={i}
                className={`h-3 ${w} rounded-md bg-white/5 animate-skeleton ${
                  i === 2 || i === 3 ? "ml-auto" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Rows */}
        {rows.map((_, i) => (
          <div
            key={i}
            className="border-b border-glass-border last:border-0 px-6 py-4 flex items-center"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex-1 grid grid-cols-4 gap-6 items-center">
              {/* ID */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-skeleton" />
                <div className="h-4 w-16 rounded-md bg-white/5 animate-skeleton" />
              </div>

              {/* Date */}
              <div>
                <div className="h-4 w-36 rounded-md bg-white/5 animate-skeleton" />
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="h-5 w-24 rounded-md bg-white/5 animate-skeleton" />
              </div>

              {/* Action / Detail link */}
              <div className="flex justify-end">
                <div className="h-8 w-20 rounded-xl bg-white/5 animate-skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden divide-y divide-glass-border">
        {rows.map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-skeleton" />
                <div className="h-4 w-16 rounded-md bg-white/5 animate-skeleton" />
              </div>
              <div className="h-5 w-24 rounded-md bg-white/5 animate-skeleton" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 rounded-md bg-white/5 animate-skeleton" />
              <div className="h-7 w-20 rounded-lg bg-white/5 animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
