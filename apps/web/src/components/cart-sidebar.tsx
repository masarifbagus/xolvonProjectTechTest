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

      {/* Sidebar Panel - Desktop Kasir Style */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-md
          flex flex-col bg-white border-l-2 border-border shadow-2xl
          ${closing ? "animate-slide-out-right" : "animate-slide-in-right"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">
              🛒
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                Keranjang Belanja
              </h2>
              <p className="text-[11px] text-text-secondary -mt-0.5">
                {totalItems} item terdistribusi
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="px-2.5 py-1 rounded text-xs font-semibold border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-all flex items-center gap-1"
            aria-label="Tutup keranjang"
          >
            <span>Tutup</span>
            <kbd className="font-mono text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1 rounded">Esc</kbd>
          </button>
        </div>

        {/* Panel Total Transaksi Raksasa */}
        <div className="bg-slate-100 border-b-2 border-border p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
            TOTAL BELANJA KASIR
          </span>
          <div className="text-4xl sm:text-5xl font-black text-text-primary tabular-nums tracking-tight mt-1">
            {formatRupiah(totalPrice)}
          </div>
        </div>

        {/* Items Header & List (Density Tinggi) */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6 gap-3">
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
                <p className="text-sm font-bold text-text-primary">
                  Keranjang Masih Kosong
                </p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">
                  Tekan "+ Keranjang" pada produk atau cari produk untuk transaksi
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border border-b border-border bg-white">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 bg-surface border-b-2 border-border text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                <span>Rincian Produk</span>
                <span className="text-center w-24">Jumlah</span>
                <span className="text-right min-w-[80px]">Subtotal</span>
              </div>

              {/* Rows */}
              {items.map((item) => {
                const isLimitReached = item.qty >= item.stock;
                const isNearLimit = item.qty >= item.stock - 2 && !isLimitReached;

                return (
                  <div
                    key={item.productId}
                    className="p-3.5 flex flex-col gap-2 bg-white even:bg-surface/50 hover:bg-slate-100/60 transition-colors"
                  >
                    {/* Top Row: Name + Remove */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-text-secondary tabular-nums">
                          @ {formatRupiah(item.price)}
                        </p>
                      </div>

                      {/* Remove Button with text label */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold border border-red-200 text-danger bg-red-50 hover:bg-red-100 transition-all shrink-0 flex items-center gap-1"
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        ✕ Hapus
                      </button>
                    </div>

                    {/* Bottom Row: Qty Control & Subtotal */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        {/* Decrement */}
                        <button
                          onClick={() => handleDecrement(item.productId, item.qty)}
                          className="
                            px-2 py-1 rounded border border-border bg-white text-xs font-bold text-text-primary
                            hover:bg-surface transition-all active:scale-95 shadow-2xs
                          "
                          aria-label={`Kurangi qty ${item.name}`}
                        >
                          −
                        </button>

                        {/* Qty Display */}
                        <span className="w-10 text-center text-xs font-bold tabular-nums text-text-primary bg-surface border border-border py-0.5 rounded">
                          {item.qty}
                        </span>

                        {/* Increment */}
                        <button
                          onClick={() => handleIncrement(item.productId, item.qty, item.stock)}
                          disabled={isLimitReached}
                          className={`
                            px-2 py-1 rounded border border-border bg-white text-xs font-bold transition-all active:scale-95 shadow-2xs
                            ${
                              isLimitReached
                                ? "opacity-40 cursor-not-allowed bg-surface"
                                : "text-text-primary hover:bg-surface"
                            }
                          `}
                          aria-label={`Tambah qty ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <p className="text-xs font-bold text-text-primary tabular-nums">
                        {formatRupiah(item.price * item.qty)}
                      </p>
                    </div>

                    {/* Warnings */}
                    {isLimitReached && (
                      <p className="text-[10px] font-bold text-danger bg-red-50 px-2 py-0.5 rounded border border-red-200 mt-0.5">
                        Mencapai batas stok max ({item.stock})
                      </p>
                    )}
                    {isNearLimit && (
                      <p className="text-[10px] font-bold text-warning bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-0.5">
                        Sisa stok menipis ({item.stock})
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Tombol Checkout Besar & Jelas */}
        {items.length > 0 && (
          <div className="border-t-2 border-border bg-white p-4 space-y-3 shadow-xl">
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className={`
                w-full py-4 rounded-lg text-base sm:text-lg font-black text-white uppercase tracking-wide
                transition-all active:scale-[0.99] shadow-md
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
                  <span>MEMPROSES CHECKOUT...</span>
                </>
              ) : (
                <>
                  <span>BAYAR — {formatRupiah(totalPrice)}</span>
                  <kbd className="font-mono text-xs font-normal px-2 py-0.5 bg-black/30 rounded border border-white/30 text-white uppercase ml-1">
                    F12
                  </kbd>
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
