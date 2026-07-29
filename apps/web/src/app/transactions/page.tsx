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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 border-b border-glass-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/25 transition-transform group-hover:scale-105">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="6" height="6" rx="1.5" fill="currentColor" />
                    <rect x="11" y="3" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.7" />
                    <rect x="3" y="11" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.7" />
                    <rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">Mini POS</h1>
                  <p className="text-[11px] text-muted -mt-0.5">Riwayat Transaksi</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-glass-border">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-white/5 transition-all"
                >
                  Produk
                </Link>
                <Link
                  href="/transactions"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white shadow-sm transition-all"
                >
                  Riwayat Transaksi
                </Link>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="sm:hidden px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-glass-border text-foreground hover:bg-white/10 transition-all"
              >
                Produk
              </Link>

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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Riwayat Penjualan</h2>
            <p className="text-xs text-muted">
              Daftar transaksi penjualan terurut dari yang terbaru.
            </p>
          </div>

          {!loading && !error && transactions.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-glass-border text-xs">
                <span className="text-muted">Total Transaksi: </span>
                <span className="font-semibold text-foreground">{totalTransactions}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-muted">Omset: </span>
                <span className="font-bold text-emerald-400 font-mono">{formatRupiah(grandTotalSales)}</span>
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
          <div className="rounded-2xl border border-glass-border bg-surface overflow-hidden shadow-xl">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] border-b border-glass-border text-muted uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID Transaksi</th>
                    <th className="px-6 py-4">Waktu Transaksi</th>
                    <th className="px-6 py-4 text-right">Total Biaya</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => handleOpenDetail(tx.id)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                            #
                          </span>
                          #{tx.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(tx.id);
                          }}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                            text-xs font-medium bg-white/5 border border-glass-border
                            text-foreground group-hover:bg-accent group-hover:text-white
                            group-hover:border-accent shadow-sm transition-all
                          "
                        >
                          <span>Lihat Detail</span>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M6 12L10 8L6 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
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
            <div className="md:hidden divide-y divide-glass-border">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => handleOpenDetail(tx.id)}
                  className="p-4 space-y-3 hover:bg-white/[0.02] cursor-pointer transition-colors active:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-bold font-mono">
                        #
                      </span>
                      <span className="font-mono font-semibold text-foreground text-sm">
                        #{tx.id}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatRupiah(tx.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted">{formatDate(tx.createdAt)}</span>
                    <span className="text-accent font-medium flex items-center gap-1">
                      Detail
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 12L10 8L6 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
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
      <footer className="border-t border-glass-border py-4 mt-auto">
        <p className="text-center text-xs text-muted">
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
