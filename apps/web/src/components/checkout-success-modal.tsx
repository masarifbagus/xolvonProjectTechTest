"use client";

import { formatRupiah } from "@/lib/format";
import type { CheckoutResponse } from "@/types/cart";

// ─── Types ────────────────────────────────────────────────────

interface CheckoutSuccessModalProps {
  result: CheckoutResponse;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function CheckoutSuccessModal({
  result,
  onClose,
}: CheckoutSuccessModalProps) {
  const formattedDate = new Date(result.createdAt).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-success-title"
          className="
            pointer-events-auto w-full max-w-md
            bg-white border-2 border-border
            rounded-lg shadow-2xl animate-slide-up
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 text-center bg-slate-50 border-b border-border">
            {/* Success Icon */}
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mb-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-success"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="checkout-success-title"
              className="text-lg font-black text-text-primary uppercase tracking-wide"
            >
              TRANSAKSI BERHASIL!
            </h2>
            <p className="text-xs font-bold text-text-secondary mt-0.5">
              ID Transaksi: <span className="tabular-nums text-text-primary">#{result.id}</span>
            </p>
          </div>

          {/* Items Table - High Density */}
          <div className="p-4">
            <div className="rounded border-2 border-border bg-white overflow-hidden shadow-2xs">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 bg-surface border-b-2 border-border text-[11px] text-text-secondary uppercase tracking-wider font-extrabold">
                <span>Produk</span>
                <span className="text-right">Harga</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Subtotal</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-border">
                {result.items.map((item) => (
                  <div
                    key={item.productId}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 text-xs items-center even:bg-surface/50"
                  >
                    <span className="text-text-primary font-bold truncate">
                      {item.productName}
                    </span>
                    <span className="text-text-secondary tabular-nums text-right whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="text-text-primary text-center tabular-nums font-black bg-slate-100 px-1 rounded">
                      {item.qty}
                    </span>
                    <span className="text-text-primary font-bold tabular-nums text-right whitespace-nowrap">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="grid grid-cols-[1fr_auto] gap-3 px-3.5 py-3 border-t-2 border-border bg-slate-100">
                <span className="text-xs font-black text-text-primary uppercase tracking-wider">TOTAL PEMBAYARAN</span>
                <span className="text-lg font-black text-primary tabular-nums">
                  {formatRupiah(result.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Time & Close */}
          <div className="px-4 pb-4 space-y-2 text-center">
            <p className="text-[11px] font-semibold text-text-secondary">
              {formattedDate}
            </p>

            <button
              onClick={onClose}
              className="
                w-full py-2.5 rounded text-xs font-black uppercase tracking-wider
                border border-border bg-slate-100 hover:bg-slate-200 text-text-primary
                transition-all shadow-2xs flex items-center justify-center gap-1.5
              "
            >
              <span>Tutup Struk</span>
              <kbd className="font-mono text-[10px] bg-white border px-1 rounded">Esc</kbd>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
