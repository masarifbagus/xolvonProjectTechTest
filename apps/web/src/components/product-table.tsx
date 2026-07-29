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
    <div className="rounded-lg border-2 border-border bg-white shadow-xs overflow-hidden">
      {/* Desktop Table - Traditional Kasir High-Density Style */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b-2 border-border text-text-secondary text-[11px] font-semibold uppercase tracking-wider">
              <th className="px-4 py-2.5">Nama Produk</th>
              <th className="px-4 py-2.5 text-right">Harga Satuan</th>
              <th className="px-4 py-2.5 text-center">Stok</th>
              <th className="px-4 py-2.5 text-center">Status</th>
              <th className="px-4 py-2.5 text-right">Aksi Kasir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white text-text-primary">
            {products.map((product) => {
              const isActive = product.isActive === 1;
              const isToggling = togglingIds.has(product.id);

              return (
                <tr
                  key={product.id}
                  className="even:bg-surface/50 hover:bg-slate-100/70 transition-colors"
                >
                  {/* Nama Produk */}
                  <td className="px-4 py-2 font-medium">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`
                          w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold shrink-0 border
                          ${
                            isActive
                              ? "bg-slate-100 text-slate-800 border-slate-300"
                              : "bg-surface text-text-secondary border-border"
                          }
                        `}
                      >
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`font-semibold ${
                          isActive ? "text-text-primary" : "text-text-secondary line-through"
                        }`}
                      >
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* Harga */}
                  <td className="px-4 py-2 text-right font-bold tabular-nums text-text-primary">
                    {formatRupiah(product.price)}
                  </td>

                  {/* Stok Badge */}
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`
                        inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tabular-nums border
                        ${
                          product.stock === 0
                            ? "bg-red-50 text-danger border-red-200"
                            : product.stock <= 10
                            ? "bg-amber-50 text-warning border-amber-200"
                            : "bg-emerald-50 text-success border-emerald-200"
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

                  {/* Status Toggle & Label */}
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`
                          inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                          ${
                            isActive
                              ? "bg-emerald-50 text-success border-emerald-200"
                              : "bg-slate-100 text-text-secondary border-slate-300"
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

                  {/* Actions (Full Text Labels) */}
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isActive && product.stock > 0 && (
                        <button
                          onClick={() => onAddToCart(product)}
                          className="
                            inline-flex items-center gap-1 px-3 py-1 rounded
                            text-xs font-bold bg-primary text-white hover:bg-primary-hover
                            shadow-2xs transition-all active:scale-95 border border-primary-hover
                          "
                          aria-label={`Tambah ${product.name} ke keranjang`}
                        >
                          <span>+ Keranjang</span>
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(product)}
                        className="
                          inline-flex items-center gap-1 px-2.5 py-1 rounded
                          text-xs font-semibold border border-border bg-white text-text-primary
                          hover:bg-surface transition-all shadow-2xs
                        "
                        aria-label={`Edit ${product.name}`}
                      >
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-border">
        {products.map((product) => {
          const isActive = product.isActive === 1;
          const isToggling = togglingIds.has(product.id);

          return (
            <div
              key={product.id}
              className="p-3.5 flex flex-col gap-2.5 bg-white even:bg-surface/50 hover:bg-slate-50 transition-colors"
            >
              {/* Top Row: Avatar + Name + Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`
                      w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 border
                      ${
                        isActive
                          ? "bg-slate-100 text-slate-800 border-slate-300"
                          : "bg-surface text-text-secondary border-border"
                      }
                    `}
                  >
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`font-semibold text-xs truncate ${
                      isActive ? "text-text-primary" : "text-text-secondary line-through"
                    }`}
                  >
                    {product.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`
                      inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border
                      ${
                        isActive
                          ? "bg-emerald-50 text-success border-emerald-200"
                          : "bg-slate-100 text-text-secondary border-slate-300"
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

              {/* Bottom Row: Price + Stock + Action buttons with text */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs tabular-nums text-text-primary">
                    {formatRupiah(product.price)}
                  </span>
                  <span
                    className={`
                      inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums border
                      ${
                        product.stock === 0
                          ? "bg-red-50 text-danger border-red-200"
                          : product.stock <= 10
                          ? "bg-amber-50 text-warning border-amber-200"
                          : "bg-emerald-50 text-success border-emerald-200"
                      }
                    `}
                  >
                    Stok: {product.stock}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isActive && product.stock > 0 && (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="
                        inline-flex items-center px-2.5 py-1 rounded
                        text-xs font-bold bg-primary text-white hover:bg-primary-hover
                        shadow-2xs transition-all active:scale-95
                      "
                      aria-label={`Tambah ${product.name} ke keranjang`}
                    >
                      + Keranjang
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(product)}
                    className="
                      inline-flex items-center px-2.5 py-1 rounded
                      text-xs font-semibold border border-border bg-white text-text-primary
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
