"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product, ProductFormData } from "@/types/product";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
} from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import ProductTable from "@/components/product-table";
import ProductModal from "@/components/product-modal";
import ProductSkeleton from "@/components/product-skeleton";
import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";

// ─── Page Component ───────────────────────────────────────────

export default function ProductsPage() {
  const { toast } = useToast();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Per-product toggling state
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // ─── Fetch Products ───────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Tidak dapat terhubung ke server. Pastikan API berjalan dan coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

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

            {/* Add Button */}
            {!loading && !error && (
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
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-glass-border py-4">
        <p className="text-center text-xs text-muted">
          Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
        </p>
      </footer>

      {/* Modal */}
      <ProductModal
        open={modalOpen}
        product={editingProduct}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
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
