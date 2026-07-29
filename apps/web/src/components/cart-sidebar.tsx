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
  onCheckoutSuccess: (result: CheckoutResponse) => void;
  onRefreshProducts: () => void;
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
    }, 250);
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
      onCheckoutSuccess(result);
      onRefreshProducts();
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
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
          ${closing ? "animate-fade-out" : "animate-fade-in"}
        `}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-md
          flex flex-col
          bg-background border-l border-glass-border
          shadow-2xl shadow-black/40
          ${closing ? "animate-slide-out-right" : "animate-slide-in-right"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="text-accent"
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
              <h2 className="text-sm font-semibold text-foreground">
                Keranjang
              </h2>
              <p className="text-[11px] text-muted -mt-0.5">
                {totalItems} item
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5 transition-all"
            aria-label="Tutup keranjang"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-muted"
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
                <p className="text-sm font-medium text-foreground/70">
                  Keranjang kosong
                </p>
                <p className="text-xs text-muted mt-1">
                  Tambahkan produk dari daftar untuk mulai belanja
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="
                    rounded-xl border border-glass-border bg-surface p-4
                    hover:border-white/10 transition-colors
                  "
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted font-mono">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded-lg text-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                      aria-label={`Hapus ${item.name} dari keranjang`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 3.5H12M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M3.5 3.5V11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5V3.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Qty Control + Subtotal */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {/* Minus */}
                      <button
                        onClick={() => handleDecrement(item.productId, item.qty)}
                        className="
                          w-8 h-8 rounded-lg border border-glass-border
                          flex items-center justify-center
                          text-foreground/60 hover:text-foreground hover:bg-white/5
                          transition-all active:scale-90
                        "
                        aria-label={`Kurangi qty ${item.name}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>

                      {/* Qty Display */}
                      <span className="w-10 text-center text-sm font-semibold text-foreground tabular-nums">
                        {item.qty}
                      </span>

                      {/* Plus */}
                      <button
                        onClick={() => handleIncrement(item.productId, item.qty, item.stock)}
                        disabled={item.qty >= item.stock}
                        className={`
                          w-8 h-8 rounded-lg border border-glass-border
                          flex items-center justify-center
                          transition-all active:scale-90
                          ${
                            item.qty >= item.stock
                              ? "text-foreground/20 cursor-not-allowed opacity-50"
                              : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                          }
                        `}
                        aria-label={`Tambah qty ${item.name}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>

                      {/* Stock indicator */}
                      {item.qty >= item.stock && (
                        <span className="ml-2 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          Maks
                        </span>
                      )}
                    </div>

                    {/* Subtotal */}
                    <p className="text-sm font-medium text-foreground font-mono">
                      {formatRupiah(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-glass-border px-6 py-4 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="text-lg font-semibold text-foreground font-mono">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className={`
                w-full py-3 rounded-xl text-sm font-medium
                transition-all active:scale-[0.98]
                flex items-center justify-center gap-2
                ${
                  checkingOut
                    ? "bg-accent/50 text-white/70 cursor-wait"
                    : "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20"
                }
              `}
            >
              {checkingOut ? (
                <>
                  <span className="checkout-spinner" aria-hidden="true" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 2H4L4.8 5M4.8 5H14L12 10H6L4.8 5ZM7 14C7 14.5523 6.55228 15 6 15C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13C6.55228 13 7 13.4477 7 14ZM13 14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14C11 13.4477 11.4477 13 12 13C12.5523 13 13 13.4477 13 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Checkout</span>
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
