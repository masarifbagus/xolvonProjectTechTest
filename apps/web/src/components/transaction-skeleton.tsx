export default function TransactionSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden shadow-xs">
      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="bg-surface border-b border-border px-5 py-3 flex items-center">
          <div className="flex-1 grid grid-cols-4 gap-6">
            {["w-20", "w-32", "w-24", "w-16"].map((w, i) => (
              <div
                key={i}
                className={`h-3 ${w} rounded bg-slate-200 animate-skeleton ${
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
            className="border-b border-border last:border-0 px-5 py-3.5 flex items-center"
          >
            <div className="flex-1 grid grid-cols-4 gap-6 items-center">
              {/* ID */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-200 animate-skeleton shrink-0" />
                <div className="h-4 w-12 rounded bg-slate-200 animate-skeleton" />
              </div>

              {/* Date */}
              <div>
                <div className="h-4 w-32 rounded bg-slate-200 animate-skeleton" />
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="h-4 w-20 rounded bg-slate-200 animate-skeleton" />
              </div>

              {/* Action */}
              <div className="flex justify-end">
                <div className="h-7 w-20 rounded-md bg-slate-200 animate-skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden divide-y divide-border">
        {rows.map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-200 animate-skeleton shrink-0" />
                <div className="h-4 w-12 rounded bg-slate-200 animate-skeleton" />
              </div>
              <div className="h-4 w-20 rounded bg-slate-200 animate-skeleton" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded bg-slate-200 animate-skeleton" />
              <div className="h-6 w-14 rounded-md bg-slate-200 animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
