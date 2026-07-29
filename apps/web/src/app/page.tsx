"use client";

import { useCallback, useEffect, useState } from "react";
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
import ProductTable from "@/components/product-table";
import ProductModal from "@/components/product-modal";
import ProductSkeleton from "@/components/product-skeleton";
import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";
import CartSidebar from "@/components/cart-sidebar";
import CheckoutSuccessModal from "@/components/checkout-success-modal";

export default function ProductsPage() {
  const { toast } = useToast();
  const { addToCart, totalItems, refreshStock } = useCart();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // ─── Stats ────────────────────────────────────────────────

  const activeCount = products.filter((p) => p.isActive === 1).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(
    (p) => p.stock <= 10 && p.stock > 0
  ).length;

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background text-text-primary">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-white shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-xs">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="text-white"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="6"
                      height="6"
                      rx="1.5"
                      fill="currentColor"
                    />
                    <rect
                      x="10"
                      y="2"
                      width="6"
                      height="6"
                      rx="1.5"
                      fill="currentColor"
                      opacity="0.75"
                    />
                    <rect
                      x="2"
                      y="10"
                      width="6"
                      height="6"
                      rx="1.5"
                      fill="currentColor"
                      opacity="0.75"
                    />
                    <rect
                      x="10"
                      y="10"
                      width="6"
                      height="6"
                      rx="1.5"
                      fill="currentColor"
                      opacity="0.4"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-text-primary tracking-tight">
                    Mini POS
                  </h1>
                  <p className="text-[11px] text-text-secondary -mt-0.5">
                    Manajemen Produk
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden sm:flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-primary shadow-xs border border-border/50 transition-all"
                >
                  Produk
                </Link>
                <Link
                  href="/transactions"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/60 transition-all"
                >
                  Riwayat Transaksi
                </Link>
              </nav>
            </div>

            {/* Header Actions */}
            {!loading && !error && (
              <div className="flex items-center gap-2.5">
                {/* Mobile Transactions Link */}
                <Link
                  href="/transactions"
                  className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-text-primary hover:bg-slate-100 transition-all"
                >
                  Riwayat
                </Link>

                {/* Cart Button */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="
                    relative inline-flex items-center justify-center gap-2
                    px-3 py-2 rounded-lg border border-border
                    bg-white hover:bg-surface text-text-primary
                    transition-all active:scale-95 shadow-xs
                  "
                  aria-label={`Keranjang (${totalItems} item)`}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2 2H4L4.8 5M4.8 5H18L15 12H6.5L4.8 5ZM7 17C7 17.5523 6.55228 18 6 18C5.44772 18 5 17.5523 5 17C5 16.4477 5.44772 16 6 16C6.55228 16 7 16.4477 7 17ZM16 17C16 17.5523 15.5523 18 15 18C14.4477 18 14 17.5523 14 17C14 16.4477 14.4477 16 15 16C15.5523 16 16 16.4477 16 17Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="hidden sm:inline text-xs font-semibold">Keranjang</span>
                  {totalItems > 0 && (
                    <span className="
                      min-w-[20px] h-[20px] px-1.5
                      flex items-center justify-center
                      rounded-full text-[11px] font-bold tabular-nums
                      bg-primary text-white shadow-xs
                    ">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>

                {/* Add Product Button */}
                <button
                  onClick={handleOpenCreate}
                  className="
                    inline-flex items-center gap-2 px-3.5 py-2 rounded-lg
                    text-xs font-semibold bg-primary text-white
                    hover:bg-primary-hover shadow-xs
                    transition-all active:scale-95
                  "
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3V13M3 8H13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Tambah Produk</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Produk"
              value={products.length}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
                  <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              }
            />
            <StatCard
              label="Aktif"
              value={activeCount}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-success">
                  <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <StatCard
              label="Total Stok"
              value={totalStock}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-secondary">
                  <path d="M3 6L8 3L13 6V10L8 13L3 10V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 8V13M3 6L8 8M8 8L13 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              }
            />
            <StatCard
              label="Stok Rendah"
              value={lowStockCount}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-warning">
                  <path d="M8 3L14 13H2L8 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 7V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.75" fill="currentColor" />
                </svg>
              }
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
        ) : (
          <ProductTable
            products={products}
            togglingIds={togglingIds}
            onEdit={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-4 mt-auto">
        <p className="text-center text-xs text-text-secondary">
          Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
        </p>
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
    </div>
  );
}

// ─── Stat Card Helper ─────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div
      className={`
        rounded-lg border p-4 bg-white shadow-xs
        ${warning ? "border-amber-200 bg-amber-50/50" : "border-border"}
      `}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-primary tabular-nums">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
