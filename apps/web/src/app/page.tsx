"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product, ProductFormData } from "@/types/product";
import type { CheckoutResponse } from "@/types/cart";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
} from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import { useCart } from "@/components/cart-context";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import ProductTable from "@/components/product-table";
import ProductModal from "@/components/product-modal";
import ProductSkeleton from "@/components/product-skeleton";
import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";
import CartSidebar from "@/components/cart-sidebar";
import CheckoutSuccessModal from "@/components/checkout-success-modal";
import ShortcutModal from "@/components/shortcut-modal";
import { formatRupiah } from "@/lib/format";

export default function ProductsPage() {
  const { toast } = useToast();
  const { addToCart, totalItems, totalPrice, refreshStock, items } = useCart();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state & ref
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);

  // Per-product toggling state
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // Cart state
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);

  // ─── Fetch Products ───────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
      refreshStock(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Tidak dapat terhubung ke server. Pastikan API berjalan dan coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [refreshStock]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Auto-focus search input on load
  useEffect(() => {
    if (!loading && products.length > 0) {
      searchInputRef.current?.focus();
    }
  }, [loading, products.length]);

  // ─── Keyboard Shortcuts Setup ────────────────────────────

  const handleEscape = useCallback(() => {
    if (modalOpen) {
      setModalOpen(false);
      setEditingProduct(null);
      return;
    }
    if (checkoutResult) {
      setCheckoutResult(null);
      return;
    }
    if (shortcutHelpOpen) {
      setShortcutHelpOpen(false);
      return;
    }
    if (cartOpen) {
      setCartOpen(false);
      return;
    }
  }, [modalOpen, checkoutResult, shortcutHelpOpen, cartOpen]);

  const handleSearchFocus = useCallback(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  const handleToggleCart = useCallback(() => {
    setCartOpen((prev) => !prev);
  }, []);

  const handleShortcutCheckout = useCallback(() => {
    if (items.length === 0) return;
    setCartOpen(true);
  }, [items.length]);

  const handleToggleHelp = useCallback(() => {
    setShortcutHelpOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onSearchFocus: handleSearchFocus,
    onToggleCart: handleToggleCart,
    onCheckout: handleShortcutCheckout,
    onEscape: handleEscape,
    onToggleHelp: handleToggleHelp,
  });

  // ─── Create / Edit ────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      // Update
      const updated = await updateProduct(editingProduct.id, data);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast("Produk berhasil diperbarui", "success");
    } else {
      // Create
      const created = await createProduct(data);
      setProducts((prev) => [created, ...prev]);
      toast("Produk berhasil ditambahkan", "success");
    }
  };

  // ─── Toggle Status ────────────────────────────────────────

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.isActive !== 1;

    setTogglingIds((prev) => new Set(prev).add(product.id));
    try {
      const updated = await toggleProductStatus(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast(
        `${product.name} ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
        newStatus ? "success" : "info"
      );
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Gagal mengubah status",
        "error"
      );
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  // ─── Cart Handlers ────────────────────────────────────────

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast(`${product.name} ditambahkan ke keranjang`, "success");
  };

  const handleCheckoutSuccess = (result: CheckoutResponse) => {
    setCheckoutResult(result);
    loadProducts(); // refresh stok terbaru
  };

  // ─── Search Live Filter ───────────────────────────────────

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toString().includes(q) ||
      p.price.toString().includes(q)
    );
  });

  // ─── Stats ────────────────────────────────────────────────

  const activeCount = products.filter((p) => p.isActive === 1).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(
    (p) => p.stock <= 10 && p.stock > 0
  ).length;

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-white text-text-primary">
      {/* Top Desktop Kasir Header */}
      <header className="sticky top-0 z-30 border-b-2 border-border bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-primary text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                  POS
                </div>
                <div>
                  <h1 className="text-sm font-black text-text-primary uppercase tracking-tight">
                    Software Kasir Toko
                  </h1>
                  <p className="text-[11px] font-semibold text-text-secondary -mt-0.5">
                    Manajemen Produk & Transaksi
                  </p>
                </div>
              </div>

              {/* Navigation Links with Shortcut Hints */}
              <nav className="hidden md:flex items-center gap-1 bg-surface p-1 rounded border border-border">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded text-xs font-bold bg-white text-primary border border-border shadow-2xs flex items-center gap-1.5"
                >
                  <span>Produk</span>
                  <kbd className="font-mono text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1 rounded">
                    Ctrl+P
                  </kbd>
                </Link>
                <Link
                  href="/transactions"
                  className="px-3 py-1.5 rounded text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <span>Riwayat Transaksi</span>
                  <kbd className="font-mono text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1 rounded">
                    Ctrl+H
                  </kbd>
                </Link>
              </nav>
            </div>

            {/* Total Transaksi Header Banner + Cart & Actions */}
            {!loading && !error && (
              <div className="flex items-center gap-3">
                {/* Total Transaksi Banner in Header */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded bg-slate-100 border border-slate-300">
                  <span className="text-[11px] font-extrabold uppercase text-text-secondary">
                    TOTAL KASIR:
                  </span>
                  <span className="text-xl font-black text-text-primary tabular-nums">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>

                {/* Mobile Transactions Link */}
                <Link
                  href="/transactions"
                  className="md:hidden px-2.5 py-1.5 rounded text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-slate-100"
                >
                  Riwayat
                </Link>

                {/* Cart Button with F9 shortcut hint */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-3.5 py-2 rounded border-2 border-border
                    bg-white hover:bg-surface text-text-primary
                    transition-all active:scale-95 shadow-2xs
                  "
                  aria-label={`Keranjang (${totalItems} item)`}
                >
                  <span className="text-xs font-bold">Keranjang</span>
                  <kbd className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                    F9
                  </kbd>
                  {totalItems > 0 && (
                    <span className="
                      px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums
                      bg-primary text-white shadow-2xs
                    ">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Add Product Button */}
                <button
                  onClick={handleOpenCreate}
                  className="
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded
                    text-xs font-bold bg-primary text-white
                    hover:bg-primary-hover shadow-2xs border border-primary-hover
                    transition-all active:scale-95 uppercase tracking-wide
                  "
                >
                  <span>+ Tambah Produk</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Prominent Search Bar (Requirement 2) */}
        {!loading && !error && (
          <div className="bg-surface p-4 rounded-lg border-2 border-border shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary font-bold text-sm">
                  🔍
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau kode produk... (Fokus: F1)"
                  className="
                    w-full pl-10 pr-24 py-3 rounded-md text-sm font-semibold
                    bg-white border-2 border-slate-300
                    text-text-primary placeholder:text-text-secondary/70 placeholder:font-normal
                    focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                    transition-all shadow-xs
                  "
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-bold text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300"
                    >
                      Reset
                    </button>
                  )}
                  <kbd className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded">
                    F1
                  </kbd>
                </div>
              </div>

              {/* Shortcut Help Trigger Button */}
              <button
                onClick={() => setShortcutHelpOpen(true)}
                className="px-3.5 py-3 rounded-md border border-border bg-white hover:bg-slate-100 text-xs font-bold text-text-primary flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
              >
                <span>⌨ Pintasan Key</span>
                <kbd className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1 rounded font-bold">?</kbd>
              </button>
            </div>

            {searchQuery.trim() && (
              <p className="text-xs font-medium text-text-secondary">
                Menampilkan <strong className="text-text-primary">{filteredProducts.length}</strong> hasil pencarian untuk "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Produk Toko" value={products.length} />
            <StatCard label="Produk Aktif" value={activeCount} color="success" />
            <StatCard label="Total Stok Fisik" value={totalStock} />
            <StatCard
              label="Stok Menipis (≤10)"
              value={lowStockCount}
              color="warning"
              warning={lowStockCount > 0}
            />
          </div>
        )}

        {/* Content: Loading / Error / Empty / Table */}
        {loading ? (
          <ProductSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <EmptyState onAddProduct={handleOpenCreate} />
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-surface border-2 border-border rounded-lg space-y-3">
            <p className="text-sm font-bold text-text-primary">
              Tidak ada produk yang cocok dengan pencarian "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary-hover"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <ProductTable
            products={filteredProducts}
            togglingIds={togglingIds}
            onEdit={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      {/* Shortcut Legend Footer Bar */}
      <footer className="border-t-2 border-border bg-surface py-3 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <div className="flex flex-wrap items-center gap-3 font-medium">
            <span className="font-bold text-text-primary uppercase text-[11px] tracking-wider">
              Shortcut Kasir:
            </span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">F1</kbd> Cari</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">F9</kbd> Keranjang</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">F12</kbd> Bayar</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">Esc</kbd> Tutup</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">Ctrl+H</kbd> Riwayat</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">Ctrl+P</kbd> Produk</span>
          </div>

          <p className="text-[11px] text-text-secondary shrink-0">
            Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
          </p>
        </div>
      </footer>

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        product={editingProduct}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckoutSuccess={handleCheckoutSuccess}
        onRefreshProducts={loadProducts}
      />

      {/* Checkout Success Modal */}
      {checkoutResult && (
        <CheckoutSuccessModal
          result={checkoutResult}
          onClose={() => setCheckoutResult(null)}
        />
      )}

      {/* Shortcut Help Modal */}
      <ShortcutModal
        open={shortcutHelpOpen}
        onClose={() => setShortcutHelpOpen(false)}
      />
    </div>
  );
}

// ─── Stat Card Helper ─────────────────────────────────────────

function StatCard({
  label,
  value,
  color = "default",
  warning = false,
}: {
  label: string;
  value: number;
  color?: "default" | "success" | "warning";
  warning?: boolean;
}) {
  return (
    <div
      className={`
        rounded-lg border-2 p-3.5 bg-white shadow-2xs flex flex-col justify-between
        ${warning ? "border-amber-300 bg-amber-50/50" : "border-border"}
      `}
    >
      <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
        {label}
      </span>
      <p
        className={`
          text-2xl sm:text-3xl font-black tabular-nums mt-1
          ${
            color === "success"
              ? "text-success"
              : color === "warning"
              ? "text-warning"
              : "text-text-primary"
          }
        `}
      >
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
