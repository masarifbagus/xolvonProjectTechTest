"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { TransactionSummary } from "@/types/transaction";
import { fetchTransactions } from "@/lib/api";
import { formatRupiah, formatDate } from "@/lib/format";
import TransactionSkeleton from "@/components/transaction-skeleton";
import TransactionEmptyState from "@/components/transaction-empty-state";
import TransactionDetailModal from "@/components/transaction-detail-modal";
import ErrorState from "@/components/error-state";
import { useCart } from "@/components/cart-context";
import CartSidebar from "@/components/cart-sidebar";

export default function TransactionsPage() {
  const { totalItems } = useCart();

  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected transaction for modal detail
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Cart sidebar state
  const [cartOpen, setCartOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal terhubung ke server untuk mengambil riwayat transaksi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleOpenDetail = (id: number) => {
    setSelectedTxId(id);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedTxId(null);
  };

  // Stats calculation
  const totalTransactions = transactions.length;
  const grandTotalSales = transactions.reduce((acc, tx) => acc + tx.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-white shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
                    <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.75" />
                    <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.75" />
                    <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-text-primary tracking-tight">Mini POS</h1>
                  <p className="text-[11px] text-text-secondary -mt-0.5">Riwayat Transaksi</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden sm:flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/60 transition-all"
                >
                  Produk
                </Link>
                <Link
                  href="/transactions"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-primary shadow-xs border border-border/50 transition-all"
                >
                  Riwayat Transaksi
                </Link>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-text-primary hover:bg-slate-100 transition-all"
              >
                Produk
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">Riwayat Penjualan</h2>
            <p className="text-xs text-text-secondary">
              Daftar transaksi kasir terurut dari yang paling terbaru.
            </p>
          </div>

          {!loading && !error && transactions.length > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-lg bg-white border border-border shadow-xs text-xs">
                <span className="text-text-secondary">Total: </span>
                <span className="font-bold text-text-primary tabular-nums">{totalTransactions} Transaksi</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-text-secondary">Omset: </span>
                <span className="font-bold text-success tabular-nums">{formatRupiah(grandTotalSales)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content: Loading / Error / Empty / Table */}
        {loading ? (
          <TransactionSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadTransactions} />
        ) : transactions.length === 0 ? (
          <TransactionEmptyState />
        ) : (
          <div className="rounded-lg border border-border bg-white shadow-xs overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border text-text-secondary text-[11px] font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">ID Transaksi</th>
                    <th className="px-5 py-3">Waktu Transaksi</th>
                    <th className="px-5 py-3 text-right">Total Biaya</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => handleOpenDetail(tx.id)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5 font-bold tabular-nums text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-blue-50 text-primary border border-blue-100 flex items-center justify-center text-xs font-bold">
                            #
                          </span>
                          #{tx.id}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary text-xs font-medium tabular-nums">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-success tabular-nums">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(tx.id);
                          }}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                            text-xs font-semibold bg-white border border-border
                            text-text-primary hover:bg-primary hover:text-white
                            hover:border-primary transition-all shadow-xs
                          "
                        >
                          <span>Lihat Detail</span>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M6 12L10 8L6 4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-border">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => handleOpenDetail(tx.id)}
                  className="p-4 space-y-2.5 hover:bg-slate-50/70 cursor-pointer transition-colors active:bg-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-blue-50 text-primary border border-blue-100 flex items-center justify-center text-xs font-bold">
                        #
                      </span>
                      <span className="font-bold text-text-primary text-xs tabular-nums">
                        #{tx.id}
                      </span>
                    </div>
                    <span className="font-bold text-success text-xs tabular-nums">
                      {formatRupiah(tx.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-text-secondary tabular-nums text-[11px]">{formatDate(tx.createdAt)}</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      Detail
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 12L10 8L6 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-4 mt-auto">
        <p className="text-center text-xs text-text-secondary">
          Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
        </p>
      </footer>

      {/* Detail Modal */}
      <TransactionDetailModal
        transactionId={selectedTxId}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
