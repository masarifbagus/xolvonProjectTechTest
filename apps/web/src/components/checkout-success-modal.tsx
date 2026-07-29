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
            bg-white border border-border
            rounded-lg shadow-xl animate-slide-up
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
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
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="checkout-success-title"
              className="text-base font-bold text-text-primary"
            >
              Transaksi Berhasil!
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              ID Transaksi: <span className="font-semibold tabular-nums text-text-primary">#{result.id}</span>
            </p>
          </div>

          {/* Items Table */}
          <div className="px-6 pb-4">
            <div className="rounded-md border border-border bg-white overflow-hidden shadow-xs">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3.5 py-2.5 bg-surface border-b border-border text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
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
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3.5 py-2.5 text-xs items-center"
                  >
                    <span className="text-text-primary font-medium truncate">
                      {item.productName}
                    </span>
                    <span className="text-text-secondary tabular-nums text-right whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="text-text-primary text-center tabular-nums font-semibold">
                      {item.qty}
                    </span>
                    <span className="text-text-primary font-semibold tabular-nums text-right whitespace-nowrap">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="grid grid-cols-[1fr_auto] gap-3 px-3.5 py-3 border-t border-border bg-slate-50">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Total Pembayaran</span>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {formatRupiah(result.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Time & Close */}
          <div className="px-6 pb-6 space-y-3">
            <p className="text-center text-[11px] text-text-secondary">
              {formattedDate}
            </p>

            <button
              onClick={onClose}
              className="
                w-full py-2 rounded-md text-xs font-semibold
                border border-border bg-white text-text-primary
                hover:bg-surface transition-all shadow-xs
              "
            >
              Tutup Modal
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
