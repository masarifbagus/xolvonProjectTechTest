interface EmptyStateProps {
  onAddProduct: () => void;
}

export default function EmptyState({ onAddProduct }: EmptyStateProps) {
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
            d="M6 8H26L24 26H8L6 8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 12V6C12 4.89543 12.8954 4 14 4H18C19.1046 4 20 4.89543 20 6V12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M14 17V22M18 17V22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Belum ada produk
      </h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        Mulai tambahkan produk pertama Anda untuk mengelola inventaris toko.
      </p>

      <button
        onClick={onAddProduct}
        className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
          text-sm font-medium bg-accent text-white
          hover:bg-accent-hover
          shadow-lg shadow-accent/20
          transition-all
        "
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
