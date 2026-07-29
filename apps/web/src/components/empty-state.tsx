interface EmptyStateProps {
  onAddProduct: () => void;
}

export default function EmptyState({ onAddProduct }: EmptyStateProps) {
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
            d="M6 8H26L24 26H8L6 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 12V6C12 4.89543 12.8954 4 14 4H18C19.1046 4 20 4.89543 20 6V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-sm font-bold text-text-primary mb-1">
        Belum Ada Produk Ditambahkan
      </h3>
      <p className="text-xs text-text-secondary max-w-xs mb-5">
        Mulai tambahkan produk pertama Anda untuk mengelola inventaris toko dan melayani kasir.
      </p>

      <button
        onClick={onAddProduct}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-md
          text-xs font-semibold bg-primary text-white
          hover:bg-primary-hover shadow-xs transition-all active:scale-95
        "
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 3V13M3 8H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Tambah Produk Pertama
      </button>
    </div>
  );
}
