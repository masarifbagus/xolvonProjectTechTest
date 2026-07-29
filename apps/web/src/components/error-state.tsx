interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 flex flex-col items-center text-center shadow-xs">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-red-100 text-danger border border-red-200 flex items-center justify-center mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 8V13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>

      <h3 className="text-sm font-bold text-danger mb-1">
        Gagal Memuat Data dari Server
      </h3>
      <p className="text-xs text-danger/90 max-w-md mb-2 font-medium">
        {message}
      </p>
      <p className="text-[11px] text-text-secondary max-w-sm mb-5">
        Pastikan koneksi internet Anda stabil atau server API dalam keadaan berjalan, lalu tekan tombol coba lagi.
      </p>

      <button
        onClick={onRetry}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-md
          text-xs font-semibold
          bg-white text-text-primary border border-border
          hover:bg-surface transition-all shadow-xs active:scale-95
        "
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8C2 4.68629 4.68629 2 8 2C10.2208 2 12.1464 3.26297 13.1291 5.1M14 8C14 11.3137 11.3137 14 8 14C5.77924 14 3.85361 12.737 2.87091 10.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M13 2V5.5H9.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Coba Muat Ulang
      </button>
    </div>
  );
}
