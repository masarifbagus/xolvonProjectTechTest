export default function ProductSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="rounded-2xl border border-glass-border bg-surface overflow-hidden">
      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="border-b border-glass-border px-6 py-4 flex items-center">
          <div className="flex-1 grid grid-cols-5 gap-6">
            {["w-16", "w-12", "w-10", "w-14", "w-10"].map((w, i) => (
              <div
                key={i}
                className={`h-3 ${w} rounded-md bg-white/5 animate-skeleton`}
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
            <div className="flex-1 grid grid-cols-5 gap-6 items-center">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 animate-skeleton" />
                <div
                  className="h-4 rounded-md bg-white/5 animate-skeleton"
                  style={{ width: `${60 + Math.random() * 60}px` }}
                />
              </div>

              {/* Price */}
              <div className="flex justify-end">
                <div className="h-4 w-20 rounded-md bg-white/5 animate-skeleton" />
              </div>

              {/* Stock */}
              <div className="flex justify-end">
                <div className="h-5 w-10 rounded-lg bg-white/5 animate-skeleton" />
              </div>

              {/* Toggle */}
              <div className="flex justify-center">
                <div className="w-11 h-6 rounded-full bg-white/5 animate-skeleton" />
              </div>

              {/* Edit */}
              <div className="flex justify-end">
                <div className="h-6 w-14 rounded-lg bg-white/5 animate-skeleton" />
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
                <div className="w-9 h-9 rounded-xl bg-white/5 animate-skeleton" />
                <div
                  className="h-4 rounded-md bg-white/5 animate-skeleton"
                  style={{ width: `${80 + Math.random() * 40}px` }}
                />
              </div>
              <div className="w-11 h-6 rounded-full bg-white/5 animate-skeleton" />
            </div>
            <div className="flex items-center justify-between pl-12">
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded-md bg-white/5 animate-skeleton" />
                <div className="h-5 w-16 rounded-md bg-white/5 animate-skeleton" />
              </div>
              <div className="h-6 w-14 rounded-lg bg-white/5 animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
