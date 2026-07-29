"use client";

import { useCallback, useEffect, useState } from "react";
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

// ─── Page Component ───────────────────────────────────────────

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
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-glass-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
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
                    opacity="0.9"
                  />
                  <rect
                    x="10"
                    y="2"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="2"
                    y="10"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="10"
                    y="10"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.3"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  Mini POS
                </h1>
                <p className="text-[11px] text-muted -mt-0.5">
                  Manajemen Produk
                </p>
              </div>
            </div>

            {/* Header Actions */}
            {!loading && !error && (
              <div className="flex items-center gap-2">
                {/* Cart Button */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="
                    relative inline-flex items-center justify-center
                    w-10 h-10 rounded-xl
                    text-foreground/60 hover:text-foreground
                    hover:bg-white/5
                    transition-all active:scale-95
                  "
                  aria-label={`Keranjang (${totalItems} item)`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2 2H4L4.8 5M4.8 5H18L15 12H6.5L4.8 5ZM7 17C7 17.5523 6.55228 18 6 18C5.44772 18 5 17.5523 5 17C5 16.4477 5.44772 16 6 16C6.55228 16 7 16.4477 7 17ZM16 17C16 17.5523 15.5523 18 15 18C14.4477 18 14 17.5523 14 17C14 16.4477 14.4477 16 15 16C15.5523 16 16 16.4477 16 17Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {totalItems > 0 && (
                    <span className="
                      absolute -top-0.5 -right-0.5
                      min-w-[18px] h-[18px] px-1
                      flex items-center justify-center
                      rounded-full text-[10px] font-bold
                      bg-accent text-white
                      shadow-lg shadow-accent/30
                      animate-cart-badge
                    ">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>

                {/* Add Product Button */}
                <button
                  onClick={handleOpenCreate}
                  className="
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl
                    text-sm font-medium bg-accent text-white
                    hover:bg-accent-hover
                    shadow-lg shadow-accent/20
                    transition-all active:scale-95
                  "
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3V13M3 8H13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">Tambah Produk</span>
                  <span className="sm:hidden">Tambah</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards — hanya tampil saat ada data */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Total Produk"
              value={products.length}
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-violet-400"
                >
                  <rect
                    x="2"
                    y="2"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="9"
                    y="2"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="2"
                    y="9"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="9"
                    y="9"
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              }
            />
            <StatCard
              label="Aktif"
              value={activeCount}
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-emerald-400"
                >
                  <path
                    d="M13.5 4.5L6.5 11.5L2.5 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <StatCard
              label="Total Stok"
              value={totalStock}
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-blue-400"
                >
                  <path
                    d="M3 6L8 3L13 6V10L8 13L3 10V6Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 8V13M3 6L8 8M8 8L13 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              }
            />
            <StatCard
              label="Stok Rendah"
              value={lowStockCount}
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-amber-400"
                >
                  <path
                    d="M8 3L14 13H2L8 3Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 7V9.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
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
      <footer className="border-t border-glass-border py-4">
        <p className="text-center text-xs text-muted">
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
        rounded-xl border p-4
        ${warning ? "border-amber-500/20 bg-amber-500/5" : "border-glass-border bg-surface"}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted">{label}</span>
      </div>
      <p className="text-xl font-semibold text-foreground tabular-nums">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
