"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/components/toast-provider";
import { checkout } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { CheckoutResponse } from "@/types/cart";

// ─── Types ────────────────────────────────────────────────────

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  onCheckoutSuccess?: (result: CheckoutResponse) => void;
  onRefreshProducts?: () => void;
}

// ─── Component ────────────────────────────────────────────────

export default function CartSidebar({
  open,
  onClose,
  onCheckoutSuccess,
  onRefreshProducts,
}: CartSidebarProps) {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } =
    useCart();
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);
  const [closing, setClosing] = useState(false);

  // ─── Close with animation ──────────────────────────────────

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  // ─── Qty Change ────────────────────────────────────────────

  const handleIncrement = (productId: number, currentQty: number, stock: number) => {
    if (currentQty >= stock) {
      toast(`Stok tersisa hanya ${stock}`, "error");
      return;
    }
    updateQty(productId, currentQty + 1);
  };

  const handleDecrement = (productId: number, currentQty: number) => {
    if (currentQty <= 1) {
      removeItem(productId);
      return;
    }
    updateQty(productId, currentQty - 1);
  };

  // ─── Checkout ──────────────────────────────────────────────

  const handleCheckout = async () => {
    if (items.length === 0 || checkingOut) return;

    setCheckingOut(true);
    try {
      const payload = items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
      }));

      const result = await checkout(payload);

      // Sukses: kosongkan keranjang, tutup sidebar, tampilkan modal
      clearCart();
      onClose();
      onCheckoutSuccess?.(result);
      onRefreshProducts?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Checkout gagal. Silakan coba lagi.";
      toast(message, "error");
      toast("Silakan refresh data produk untuk melihat stok terbaru", "info");
    } finally {
      setCheckingOut(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-slate-900/40
          ${closing ? "animate-fade-out" : "animate-fade-in"}
        `}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel - Solid White Background */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-md
          flex flex-col bg-white border-l border-border shadow-xl
          ${closing ? "animate-slide-out-right" : "animate-slide-in-right"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="text-primary"
              >
                <path
                  d="M1 1H3L3.6 4M3.6 4H17L14 11H5L3.6 4ZM6 15.5C6 16.0523 5.55228 16.5 5 16.5C4.44772 16.5 4 16.0523 4 15.5C4 14.9477 4.44772 14.5 5 14.5C5.55228 14.5 6 14.9477 6 15.5ZM15 15.5C15 16.0523 14.5523 16.5 14 16.5C13.4477 16.5 13 16.0523 13 15.5C13 14.9477 13.4477 14.5 14 14.5C14.5523 14.5 15 14.9477 15 15.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                Keranjang Belanja
              </h2>
              <p className="text-[11px] text-text-secondary -mt-0.5">
                {totalItems} item dipilih
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-all"
            aria-label="Tutup keranjang"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
              <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-text-secondary"
                >
                  <path
                    d="M2 2H6L7.2 7M7.2 7H30L26 19H9L7.2 7ZM11 27C11 28.1046 10.1046 29 9 29C7.89543 29 7 28.1046 7 27C7 25.8954 7.89543 25 9 25C10.1046 25 11 25.8954 11 27ZM27 27C27 28.1046 26.1046 29 25 29C23.8954 29 23 28.1046 23 27C23 25.8954 23.8954 25 25 25C26.1046 25 27 25.8954 27 27Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Keranjang masih kosong
                </p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">
                  Pilih "+ Keranjang" pada produk untuk menambahkan item belanja
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-white shadow-xs">
              {items.map((item) => {
                const isLimitReached = item.qty >= item.stock;
                const isNearLimit = item.qty >= item.stock - 2 && !isLimitReached;

                return (
                  <div
                    key={item.productId}
                    className="p-4 flex flex-col gap-2.5 bg-white hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-text-secondary tabular-nums">
                            {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 rounded text-text-secondary hover:text-danger hover:bg-red-50 transition-all shrink-0"
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2 3.5H12M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M3.5 3.5V11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5V3.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Qty Control + Subtotal */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {/* Minus */}
                        <button
                          onClick={() => handleDecrement(item.productId, item.qty)}
                          className="
                            w-7 h-7 rounded-md border border-border bg-white
                            flex items-center justify-center text-text-primary
                            hover:bg-surface transition-all active:scale-95 shadow-xs
                          "
                          aria-label={`Kurangi qty ${item.name}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>

                        {/* Qty Display */}
                        <span className="w-8 text-center text-xs font-bold tabular-nums text-text-primary">
                          {item.qty}
                        </span>

                        {/* Plus */}
                        <button
                          onClick={() => handleIncrement(item.productId, item.qty, item.stock)}
                          disabled={isLimitReached}
                          className={`
                            w-7 h-7 rounded-md border border-border bg-white
                            flex items-center justify-center transition-all active:scale-95 shadow-xs
                            ${
                              isLimitReached
                                ? "opacity-40 cursor-not-allowed bg-surface"
                                : "text-text-primary hover:bg-surface"
                            }
                          `}
                          aria-label={`Tambah qty ${item.name}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      {/* Subtotal */}
                      <p className="text-xs font-bold text-text-primary tabular-nums">
                        {formatRupiah(item.price * item.qty)}
                      </p>
                    </div>

                    {/* Stock limit warning below Qty Control */}
                    {isLimitReached && (
                      <p className="text-[11px] font-medium text-danger bg-red-50 px-2 py-0.5 rounded border border-red-100 mt-1">
                        Batas stok ({item.stock} item) telah tercapai
                      </p>
                    )}
                    {isNearLimit && (
                      <p className="text-[11px] font-medium text-warning bg-amber-50 px-2 py-0.5 rounded border border-amber-100 mt-1">
                        Mendekati sisa stok ({item.stock} item)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-white p-5 space-y-4 shadow-lg">
            {/* Total */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-text-secondary">Total Pembayaran</span>
              <span className="text-lg font-bold text-text-primary tabular-nums">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className={`
                w-full py-2.5 rounded-lg text-xs font-bold text-white
                transition-all active:scale-[0.99] shadow-xs
                flex items-center justify-center gap-2
                ${
                  checkingOut
                    ? "bg-primary/70 cursor-wait"
                    : "bg-primary hover:bg-primary-hover"
                }
              `}
            >
              {checkingOut ? (
                <>
                  <span className="checkout-spinner" aria-hidden="true" />
                  <span>Memproses Checkout...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 2H4L4.8 5M4.8 5H14L12 10H6L4.8 5ZM7 14C7 14.5523 6.55228 15 6 15C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13C6.55228 13 7 13.4477 7 14ZM13 14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14C11 13.4477 11.4477 13 12 13C12.5523 13 13 13.4477 13 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Checkout Sekarang</span>
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
