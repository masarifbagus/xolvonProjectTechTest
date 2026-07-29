"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Product, ProductFormData } from "@/types/product";

// ─── Types ────────────────────────────────────────────────────

interface ProductModalProps {
  open: boolean;
  product: Product | null; // null = mode tambah, ada = mode edit
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────

export default function ProductModal({
  open,
  product,
  onClose,
  onSubmit,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const isEdit = product !== null;

  // Pre-fill form saat edit
  useEffect(() => {
    if (open && product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setError("");
    } else if (open) {
      setName("");
      setPrice("");
      setStock("");
      setError("");
    }
  }, [open, product]);

  // Auto-focus input
  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  // Close dengan animasi
  const handleClose = useCallback(() => {
    if (submitting) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  }, [onClose, submitting]);

  // Close via Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  // Close via backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) handleClose();
  };

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama produk wajib diisi");
      return;
    }

    const parsedPrice = Number(price);
    if (!price || isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Harga harus berupa angka ≥ 0");
      return;
    }
    if (!Number.isInteger(parsedPrice)) {
      setError("Harga harus bilangan bulat (tanpa desimal)");
      return;
    }

    const parsedStock = Number(stock);
    if (stock === "" || isNaN(parsedStock) || parsedStock < 0) {
      setError("Stok harus berupa angka ≥ 0");
      return;
    }
    if (!Number.isInteger(parsedStock)) {
      setError("Stok harus bilangan bulat");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        price: parsedPrice,
        stock: parsedStock,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-slate-900/40
        ${closing ? "animate-fade-out" : "animate-fade-in"}
      `}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Produk" : "Tambah Produk"}
    >
      <div
        className={`
          w-full max-w-md rounded-lg bg-white border border-border
          shadow-xl overflow-hidden
          ${closing ? "animate-fade-out" : "animate-slide-up"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <h2 className="text-sm font-bold text-text-primary">
            {isEdit ? "Edit Detail Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Tutup modal"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Banner */}
          {error && (
            <div
              className="mb-4 px-3.5 py-2.5 rounded-md text-xs font-semibold text-danger bg-red-50 border border-red-200 flex items-center gap-2"
              role="alert"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5V8.5M8 11H8.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Nama Input */}
            <div>
              <label
                htmlFor="product-name"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Nama Produk <span className="text-danger">*</span>
              </label>
              <input
                ref={nameRef}
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama produk"
                disabled={submitting}
                className="
                  w-full px-3.5 py-2 rounded-md text-xs
                  bg-white border border-border
                  text-text-primary placeholder:text-text-secondary/50
                  focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                  disabled:opacity-50 transition-all shadow-xs
                "
              />
            </div>

            {/* Harga Input */}
            <div>
              <label
                htmlFor="product-price"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Harga Satuan (Rp) <span className="text-danger">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 18000"
                disabled={submitting}
                className="
                  w-full px-3.5 py-2 rounded-md text-xs tabular-nums
                  bg-white border border-border
                  text-text-primary placeholder:text-text-secondary/50
                  focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                  disabled:opacity-50 transition-all shadow-xs
                "
              />
            </div>

            {/* Stok Input */}
            <div>
              <label
                htmlFor="product-stock"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Jumlah Stok <span className="text-danger">*</span>
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Contoh: 50"
                disabled={submitting}
                className="
                  w-full px-3.5 py-2 rounded-md text-xs tabular-nums
                  bg-white border border-border
                  text-text-primary placeholder:text-text-secondary/50
                  focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                  disabled:opacity-50 transition-all shadow-xs
                "
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="
                px-4 py-2 rounded-md text-xs font-semibold
                border border-border bg-white text-text-primary
                hover:bg-surface disabled:opacity-50 transition-all shadow-xs
              "
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="
                px-4 py-2 rounded-md text-xs font-semibold
                bg-primary text-white hover:bg-primary-hover
                disabled:opacity-50 transition-all shadow-xs
                flex items-center justify-center gap-2
              "
            >
              {submitting ? (
                <>
                  <span className="checkout-spinner" aria-hidden="true" />
                  <span>Menyimpan...</span>
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Produk"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
