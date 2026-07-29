"use client";

import type { Product } from "@/types/product";
import { formatRupiah } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────

interface ProductTableProps {
  products: Product[];
  togglingIds: Set<number>;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

// ─── Component ────────────────────────────────────────────────

export default function ProductTable({
  products,
  togglingIds,
  onEdit,
  onToggleStatus,
  onAddToCart,
}: ProductTableProps) {
  return (
    <div className="rounded-lg border border-border bg-white shadow-xs overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-surface border-b border-border text-text-secondary text-[11px] font-semibold uppercase tracking-wider">
              <th className="px-5 py-3">Produk</th>
              <th className="px-5 py-3 text-right">Harga</th>
              <th className="px-5 py-3 text-center">Stok</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white text-text-primary">
            {products.map((product) => {
              const isActive = product.isActive === 1;
              const isToggling = togglingIds.has(product.id);

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Nama */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border
                          ${
                            isActive
                              ? "bg-blue-50 text-primary border-blue-200"
                              : "bg-surface text-text-secondary border-border"
                          }
                        `}
                      >
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`font-medium ${
                          isActive ? "text-text-primary" : "text-text-secondary line-through"
                        }`}
                      >
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* Harga */}
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums text-text-primary">
                    {formatRupiah(product.price)}
                  </td>

                  {/* Stok Badge */}
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums
                        ${
                          product.stock === 0
                            ? "bg-red-100 text-danger"
                            : product.stock <= 10
                            ? "bg-amber-100 text-warning"
                            : "bg-emerald-100 text-success"
                        }
                      `}
                    >
                      {product.stock === 0
                        ? "0 (Habis)"
                        : product.stock <= 10
                        ? `${product.stock} (Menipis)`
                        : `${product.stock} (Aman)`}
                    </span>
                  </td>

                  {/* Status Badge & Toggle */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold
                          ${
                            isActive
                              ? "bg-emerald-100 text-success"
                              : "bg-slate-100 text-text-secondary"
                          }
                        `}
                      >
                        {isActive ? "Aktif" : "Nonaktif"}
                      </span>
                      <button
                        onClick={() => onToggleStatus(product)}
                        disabled={isToggling}
                        className={`toggle-switch ${isActive ? "active" : ""} ${isToggling ? "loading" : ""}`}
                        role="switch"
                        aria-checked={isActive}
                        aria-label={`${isActive ? "Nonaktifkan" : "Aktifkan"} ${product.name}`}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isActive && product.stock > 0 && (
                        <button
                          onClick={() => onAddToCart(product)}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                            text-xs font-semibold bg-primary text-white hover:bg-primary-hover
                            shadow-xs transition-all active:scale-95
                          "
                          aria-label={`Tambah ${product.name} ke keranjang`}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M1.5 1.5H3L3.6 3.5M3.6 3.5H12.5L10.5 8.5H4.5L3.6 3.5ZM5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12Z"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          + Keranjang
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(product)}
                        className="
                          inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md
                          text-xs font-medium border border-border bg-white text-text-primary
                          hover:bg-surface transition-all
                        "
                        aria-label={`Edit ${product.name}`}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M9.5 2.5L11.5 4.5M1.5 12.5L2 10L10 2L12 4L4 12L1.5 12.5Z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {products.map((product) => {
          const isActive = product.isActive === 1;
          const isToggling = togglingIds.has(product.id);

          return (
            <div
              key={product.id}
              className="p-4 flex flex-col gap-3 hover:bg-slate-50/70 transition-colors"
            >
              {/* Top Row: avatar + name + status badge & toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`
                      w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border
                      ${
                        isActive
                          ? "bg-blue-50 text-primary border-blue-200"
                          : "bg-surface text-text-secondary border-border"
                      }
                    `}
                  >
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`font-medium truncate ${
                      isActive ? "text-text-primary" : "text-text-secondary line-through"
                    }`}
                  >
                    {product.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
                      ${
                        isActive
                          ? "bg-emerald-100 text-success"
                          : "bg-slate-100 text-text-secondary"
                      }
                    `}
                  >
                    {isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <button
                    onClick={() => onToggleStatus(product)}
                    disabled={isToggling}
                    className={`toggle-switch ${isActive ? "active" : ""} ${isToggling ? "loading" : ""}`}
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${isActive ? "Nonaktifkan" : "Aktifkan"} ${product.name}`}
                  />
                </div>
              </div>

              {/* Info Row */}
              <div className="flex items-center justify-between pl-11">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold tabular-nums text-text-primary">
                    {formatRupiah(product.price)}
                  </span>
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums
                      ${
                        product.stock === 0
                          ? "bg-red-100 text-danger"
                          : product.stock <= 10
                          ? "bg-amber-100 text-warning"
                          : "bg-emerald-100 text-success"
                      }
                    `}
                  >
                    {product.stock === 0
                      ? "Stok Habis"
                      : product.stock <= 10
                      ? `Stok: ${product.stock}`
                      : `Stok: ${product.stock}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isActive && product.stock > 0 && (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="
                        inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md
                        text-xs font-semibold bg-primary text-white hover:bg-primary-hover
                        shadow-xs transition-all active:scale-95
                      "
                      aria-label={`Tambah ${product.name} ke keranjang`}
                    >
                      + Keranjang
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(product)}
                    className="
                      inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md
                      text-xs font-medium border border-border bg-white text-text-primary
                      hover:bg-surface transition-all
                    "
                    aria-label={`Edit ${product.name}`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
