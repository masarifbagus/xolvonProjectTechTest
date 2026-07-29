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
    <div className="rounded-2xl border border-glass-border bg-surface overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left px-6 py-4 font-medium text-muted text-xs uppercase tracking-wider">
                Produk
              </th>
              <th className="text-right px-6 py-4 font-medium text-muted text-xs uppercase tracking-wider">
                Harga
              </th>
              <th className="text-right px-6 py-4 font-medium text-muted text-xs uppercase tracking-wider">
                Stok
              </th>
              <th className="text-center px-6 py-4 font-medium text-muted text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-4 font-medium text-muted text-xs uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {products.map((product) => {
              const isActive = product.isActive === 1;
              const isToggling = togglingIds.has(product.id);

              return (
                <tr
                  key={product.id}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  {/* Nama */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0
                          ${isActive ? "bg-accent/10 text-accent" : "bg-white/5 text-muted"}
                        `}
                      >
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`font-medium ${isActive ? "text-foreground" : "text-muted line-through"}`}
                      >
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* Harga */}
                  <td className="px-6 py-4 text-right font-mono text-foreground/80">
                    {formatRupiah(product.price)}
                  </td>

                  {/* Stok */}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium
                        ${
                          product.stock === 0
                            ? "bg-red-500/10 text-red-400"
                            : product.stock <= 10
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-white/5 text-foreground/70"
                        }
                      `}
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isActive && product.stock > 0 && (
                        <button
                          onClick={() => onAddToCart(product)}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                            text-xs font-medium text-accent
                            hover:bg-accent/10
                            transition-all active:scale-95
                          "
                          aria-label={`Tambah ${product.name} ke keranjang`}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M1.5 1.5H3L3.6 3.5M3.6 3.5H12.5L10.5 8.5H4.5L3.6 3.5ZM5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12Z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Keranjang
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(product)}
                        className="
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                          text-xs font-medium text-foreground/50
                          hover:text-foreground hover:bg-white/5
                          transition-all
                        "
                        aria-label={`Edit ${product.name}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M9.5 2.5L11.5 4.5M1.5 12.5L2 10L10 2L12 4L4 12L1.5 12.5Z"
                            stroke="currentColor"
                            strokeWidth="1.2"
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
      <div className="md:hidden divide-y divide-glass-border">
        {products.map((product) => {
          const isActive = product.isActive === 1;
          const isToggling = togglingIds.has(product.id);

          return (
            <div
              key={product.id}
              className="p-4 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors"
            >
              {/* Top Row: avatar + name + toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`
                      w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0
                      ${isActive ? "bg-accent/10 text-accent" : "bg-white/5 text-muted"}
                    `}
                  >
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`font-medium truncate ${isActive ? "text-foreground" : "text-muted line-through"}`}
                  >
                    {product.name}
                  </span>
                </div>

                <button
                  onClick={() => onToggleStatus(product)}
                  disabled={isToggling}
                  className={`toggle-switch shrink-0 ${isActive ? "active" : ""} ${isToggling ? "loading" : ""}`}
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`${isActive ? "Nonaktifkan" : "Aktifkan"} ${product.name}`}
                />
              </div>

              {/* Info Row */}
              <div className="flex items-center justify-between pl-12">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono text-foreground/80">
                    {formatRupiah(product.price)}
                  </span>
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                      ${
                        product.stock === 0
                          ? "bg-red-500/10 text-red-400"
                          : product.stock <= 10
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-white/5 text-foreground/70"
                      }
                    `}
                  >
                    Stok: {product.stock}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isActive && product.stock > 0 && (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                        text-xs font-medium text-accent
                        hover:bg-accent/10
                        transition-all active:scale-95
                      "
                      aria-label={`Tambah ${product.name} ke keranjang`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M1.5 1.5H3L3.6 3.5M3.6 3.5H12.5L10.5 8.5H4.5L3.6 3.5ZM5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      +Keranjang
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(product)}
                    className="
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs font-medium text-foreground/50
                      hover:text-foreground hover:bg-white/5
                      transition-all
                    "
                    aria-label={`Edit ${product.name}`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M9.5 2.5L11.5 4.5M1.5 12.5L2 10L10 2L12 4L4 12L1.5 12.5Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
