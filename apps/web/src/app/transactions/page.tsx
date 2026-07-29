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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import CartSidebar from "@/components/cart-sidebar";
import ShortcutModal from "@/components/shortcut-modal";

export default function TransactionsPage() {
  const { totalItems, totalPrice } = useCart();

  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected transaction for modal detail
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Cart sidebar state
  const [cartOpen, setCartOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);

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

  // ─── Keyboard Shortcuts Setup ────────────────────────────

  const handleEscape = useCallback(() => {
    if (detailModalOpen) {
      setDetailModalOpen(false);
      setSelectedTxId(null);
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
  }, [detailModalOpen, shortcutHelpOpen, cartOpen]);

  const handleToggleCart = useCallback(() => {
    setCartOpen((prev) => !prev);
  }, []);

  const handleToggleHelp = useCallback(() => {
    setShortcutHelpOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onToggleCart: handleToggleCart,
    onEscape: handleEscape,
    onToggleHelp: handleToggleHelp,
  });

  // Stats calculation
  const totalTransactions = transactions.length;
  const grandTotalSales = transactions.reduce((acc, tx) => acc + tx.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-primary">
      {/* Top Desktop Kasir Header */}
      <header className="sticky top-0 z-30 border-b-2 border-border bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded bg-primary text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                  POS
                </div>
                <div>
                  <h1 className="text-sm font-black text-text-primary uppercase tracking-tight">
                    Software Kasir Toko
                  </h1>
                  <p className="text-[11px] font-semibold text-text-secondary -mt-0.5">
                    Riwayat Transaksi
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 bg-surface p-1 rounded border border-border">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <span>Produk</span>
                  <kbd className="font-mono text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1 rounded">
                    Ctrl+P
                  </kbd>
                </Link>
                <Link
                  href="/transactions"
                  className="px-3 py-1.5 rounded text-xs font-bold bg-white text-primary border border-border shadow-2xs flex items-center gap-1.5"
                >
                  <span>Riwayat Transaksi</span>
                  <kbd className="font-mono text-[10px] bg-slate-100 border border-slate-300 text-slate-700 px-1 rounded">
                    Ctrl+H
                  </kbd>
                </Link>
              </nav>
            </div>

            {/* Actions */}
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

              <Link
                href="/"
                className="md:hidden px-2.5 py-1.5 rounded text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-slate-100"
              >
                Produk
              </Link>

              {/* Cart Button */}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-lg border-2 border-border">
          <div>
            <h2 className="text-base font-black text-text-primary uppercase tracking-wide">
              Riwayat Transaksi Kasir
            </h2>
            <p className="text-xs font-medium text-text-secondary">
              Daftar transaksi terurut dari yang paling terbaru.
            </p>
          </div>

          {!loading && !error && transactions.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded bg-white border border-border shadow-2xs text-xs font-bold">
                <span className="text-text-secondary">Total: </span>
                <span className="text-text-primary tabular-nums">{totalTransactions} Transaksi</span>
              </div>
              <div className="px-3.5 py-2 rounded bg-emerald-50 border border-emerald-300 shadow-2xs text-xs font-bold">
                <span className="text-text-secondary">Total Omset: </span>
                <span className="text-success tabular-nums">{formatRupiah(grandTotalSales)}</span>
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
          <div className="rounded-lg border-2 border-border bg-white shadow-xs overflow-hidden">
            {/* Desktop High-Density Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface border-b-2 border-border text-text-secondary text-[11px] font-semibold uppercase tracking-wider">
                    <th className="px-4 py-2.5">ID Transaksi</th>
                    <th className="px-4 py-2.5">Waktu Transaksi</th>
                    <th className="px-4 py-2.5 text-right">Total Biaya</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => handleOpenDetail(tx.id)}
                      className="even:bg-surface/50 hover:bg-slate-100/70 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 font-bold tabular-nums text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center text-[10px] font-bold">
                            #
                          </span>
                          #{tx.id}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary text-xs font-medium tabular-nums">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-success tabular-nums text-xs">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(tx.id);
                          }}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1 rounded
                            text-xs font-bold bg-white border border-border
                            text-text-primary hover:bg-primary hover:text-white
                            hover:border-primary transition-all shadow-2xs
                          "
                        >
                          <span>Lihat Detail</span>
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
                  className="p-3.5 space-y-2 hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center text-[10px] font-bold">
                        #
                      </span>
                      <span className="font-bold text-text-primary text-xs tabular-nums">
                        #{tx.id}
                      </span>
                    </div>
                    <span className="font-black text-success text-xs tabular-nums">
                      {formatRupiah(tx.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-text-secondary tabular-nums text-[11px]">{formatDate(tx.createdAt)}</span>
                    <span className="text-primary font-bold">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-surface py-3 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <div className="flex flex-wrap items-center gap-3 font-medium">
            <span className="font-bold text-text-primary uppercase text-[11px] tracking-wider">
              Shortcut Kasir:
            </span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">F9</kbd> Keranjang</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">Esc</kbd> Tutup</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">Ctrl+H</kbd> Riwayat</span>
            <span><kbd className="font-mono bg-white border border-slate-300 text-slate-800 font-bold px-1.5 py-0.5 rounded">Ctrl+P</kbd> Produk</span>
          </div>

          <p className="text-[11px] text-text-secondary shrink-0">
            Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
          </p>
        </div>
      </footer>

      {/* Detail Modal */}
      <TransactionDetailModal
        transactionId={selectedTxId}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Shortcut Help Modal */}
      <ShortcutModal
        open={shortcutHelpOpen}
        onClose={() => setShortcutHelpOpen(false)}
      />
    </div>
  );
}
