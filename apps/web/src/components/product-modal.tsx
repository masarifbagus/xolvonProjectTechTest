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
        bg-black/60 backdrop-blur-sm
        ${closing ? "animate-fade-out" : "animate-fade-in"}
      `}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Produk" : "Tambah Produk"}
    >
      <div
        className={`
          w-full max-w-md rounded-2xl
          bg-surface border border-glass-border
          shadow-2xl shadow-black/40
          ${closing ? "animate-slide-down" : "animate-slide-up"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Tutup modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M14 6L6 14M6 6L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          {/* Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Nama */}
            <div>
              <label
                htmlFor="product-name"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Nama Produk
              </label>
              <input
                ref={nameRef}
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kopi Susu"
                disabled={submitting}
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-background border border-glass-border
                  text-foreground placeholder:text-muted/50
                  focus:border-accent focus:ring-1 focus:ring-accent/30
                  disabled:opacity-50
                  transition-all
                "
              />
            </div>

            {/* Harga */}
            <div>
              <label
                htmlFor="product-price"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Harga (Rp)
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 25000"
                disabled={submitting}
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-background border border-glass-border
                  text-foreground placeholder:text-muted/50
                  focus:border-accent focus:ring-1 focus:ring-accent/30
                  disabled:opacity-50
                  transition-all
                "
              />
            </div>

            {/* Stok */}
            <div>
              <label
                htmlFor="product-stock"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Stok
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Contoh: 100"
                disabled={submitting}
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-background border border-glass-border
                  text-foreground placeholder:text-muted/50
                  focus:border-accent focus:ring-1 focus:ring-accent/30
                  disabled:opacity-50
                  transition-all
                "
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="
                flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-white/5 text-foreground/70
                hover:bg-white/10 hover:text-foreground
                border border-glass-border
                disabled:opacity-50
                transition-all
              "
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="
                flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-accent text-white
                hover:bg-accent-hover
                disabled:opacity-50
                shadow-lg shadow-accent/20
                transition-all
                flex items-center justify-center gap-2
              "
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                  <span>Menyimpan…</span>
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
