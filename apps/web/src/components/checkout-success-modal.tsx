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
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
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
            pointer-events-auto w-full max-w-lg
            bg-background border border-glass-border
            rounded-2xl shadow-2xl shadow-black/40
            animate-slide-up
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                className="text-emerald-400"
              >
                <path
                  d="M23 7L11 19L5 13"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="checkout-success-title"
              className="text-lg font-semibold text-foreground"
            >
              Transaksi Berhasil!
            </h2>
            <p className="text-xs text-muted mt-1">
              ID Transaksi: <span className="font-mono text-foreground/70">#{result.id}</span>
            </p>
          </div>

          {/* Items Table */}
          <div className="px-6 pb-4">
            <div className="rounded-xl border border-glass-border bg-surface overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-glass-border text-[11px] text-muted uppercase tracking-wider font-medium">
                <span>Produk</span>
                <span className="text-right">Harga</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Subtotal</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-glass-border">
                {result.items.map((item) => (
                  <div
                    key={item.productId}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 text-sm items-center"
                  >
                    <span className="text-foreground font-medium truncate">
                      {item.productName}
                    </span>
                    <span className="text-foreground/70 font-mono text-xs text-right whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="text-foreground/70 text-center tabular-nums">
                      {item.qty}
                    </span>
                    <span className="text-foreground font-mono text-right whitespace-nowrap">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-t border-glass-border bg-accent/5">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-base font-semibold text-accent font-mono">
                  {formatRupiah(result.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Time & Close */}
          <div className="px-6 pb-6 space-y-4">
            <p className="text-center text-xs text-muted">
              {formattedDate}
            </p>

            <button
              onClick={onClose}
              className="
                w-full py-3 rounded-xl text-sm font-medium
                bg-accent text-white hover:bg-accent-hover
                shadow-lg shadow-accent/20
                transition-all active:scale-[0.98]
              "
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
