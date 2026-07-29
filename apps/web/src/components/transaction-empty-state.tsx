import Link from "next/link";

export default function TransactionEmptyState() {
  return (
    <div className="rounded-2xl border border-glass-border bg-surface p-12 flex flex-col items-center text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="text-accent"
        >
          <path
            d="M10 6H22M6 11H26M8 11V24C8 25.1046 8.89543 26 10 26H22C23.1046 26 24 25.1046 24 24V11M12 16H20M12 20H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Belum ada transaksi
      </h3>
      <p className="text-sm text-muted max-w-sm mb-6">
        Riwayat transaksi penjualan Anda akan muncul di sini setelah Anda melakukan checkout pertama.
      </p>

      <Link
        href="/"
        className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
          text-sm font-medium bg-accent text-white
          hover:bg-accent-hover
          shadow-lg shadow-accent/20
          transition-all active:scale-95
        "
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 2H4L4.8 5M4.8 5H14L12 10H6.5L4.8 5ZM7 14C7 14.5523 6.55228 15 6 15C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13C6.55228 13 7 13.4477 7 14ZM14 14C14 14.5523 13.5523 15 13 15C12.4477 15 12 14.5523 12 14C12 13.4477 12.4477 13 13 13C13.5523 13 14 13.4477 14 14Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Mulai Belanja di POS
      </Link>
    </div>
  );
}
