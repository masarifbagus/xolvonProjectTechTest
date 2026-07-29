import Link from "next/link";

export default function TransactionEmptyState() {
  return (
    <div className="rounded-lg border border-border bg-white p-10 flex flex-col items-center text-center shadow-xs">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-primary">
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M10 6H22M6 11H26M8 11V24C8 25.1046 8.89543 26 10 26H22C23.1046 26 24 25.1046 24 24V11M12 16H20M12 20H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="text-sm font-bold text-text-primary mb-1">
        Belum Ada Riwayat Transaksi
      </h3>
      <p className="text-xs text-text-secondary max-w-sm mb-5">
        Riwayat transaksi kasir Anda akan dicatat dan muncul di sini setelah transaksi checkout berhasil dilakukan.
      </p>

      <Link
        href="/"
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-md
          text-xs font-semibold bg-primary text-white
          hover:bg-primary-hover shadow-xs transition-all active:scale-95
        "
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 2H4L4.8 5M4.8 5H14L12 10H6.5L4.8 5ZM7 14C7 14.5523 6.55228 15 6 15C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13C6.55228 13 7 13.4477 7 14ZM14 14C14 14.5523 13.5523 15 13 15C12.4477 15 12 14.5523 12 14C12 13.4477 12.4477 13 13 13C13.5523 13 14 13.4477 14 14Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Kembali ke Daftar Produk
      </Link>
    </div>
  );
}
