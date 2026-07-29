export default function ProductSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden shadow-xs">
      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="bg-surface border-b border-border px-5 py-3 flex items-center">
          <div className="flex-1 grid grid-cols-5 gap-6">
            {["w-16", "w-12", "w-10", "w-14", "w-10"].map((w, i) => (
              <div
                key={i}
                className={`h-3 ${w} rounded bg-slate-200 animate-skeleton`}
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
            <div className="flex-1 grid grid-cols-5 gap-6 items-center">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-200 animate-skeleton shrink-0" />
                <div className="h-4 rounded bg-slate-200 animate-skeleton w-28" />
              </div>

              {/* Price */}
              <div className="flex justify-end">
                <div className="h-4 w-20 rounded bg-slate-200 animate-skeleton" />
              </div>

              {/* Stock */}
              <div className="flex justify-center">
                <div className="h-5 w-16 rounded-full bg-slate-200 animate-skeleton" />
              </div>

              {/* Toggle */}
              <div className="flex justify-center">
                <div className="w-10 h-5 rounded-full bg-slate-200 animate-skeleton" />
              </div>

              {/* Edit */}
              <div className="flex justify-end">
                <div className="h-6 w-14 rounded-md bg-slate-200 animate-skeleton" />
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-200 animate-skeleton shrink-0" />
                <div className="h-4 w-24 rounded bg-slate-200 animate-skeleton" />
              </div>
              <div className="w-10 h-5 rounded-full bg-slate-200 animate-skeleton" />
            </div>
            <div className="flex items-center justify-between pl-11">
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 rounded bg-slate-200 animate-skeleton" />
                <div className="h-4 w-12 rounded-full bg-slate-200 animate-skeleton" />
              </div>
              <div className="h-6 w-12 rounded-md bg-slate-200 animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
