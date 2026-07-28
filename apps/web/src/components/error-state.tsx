interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12 flex flex-col items-center text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="text-red-400"
        >
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M16 10V18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="22" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Gagal Memuat Data
      </h3>
      <p className="text-sm text-muted max-w-sm mb-6">{message}</p>

      <button
        onClick={onRetry}
        className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
          text-sm font-medium
          bg-white/5 text-foreground/80 border border-glass-border
          hover:bg-white/10 hover:text-foreground
          transition-all
        "
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8C2 4.68629 4.68629 2 8 2C10.2208 2 12.1464 3.26297 13.1291 5.1M14 8C14 11.3137 11.3137 14 8 14C5.77924 14 3.85361 12.737 2.87091 10.9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13 2V5.5H9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 14V10.5H6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Coba Lagi
      </button>
    </div>
  );
}
