"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import type { TransactionDetail } from "@/types/transaction";
import { fetchTransactionDetail, ApiError } from "@/lib/api";
import { formatRupiah, formatDate } from "@/lib/format";
import { useCart } from "@/components/cart-context";
import CartSidebar from "@/components/cart-sidebar";

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionDetailPage({ params }: TransactionPageProps) {
  const resolvedParams = use(params);
  const { totalItems } = useCart();

  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  // Cart sidebar state
  const [cartOpen, setCartOpen] = useState(false);

  const txId = parseInt(resolvedParams.id, 10);

  const loadDetail = useCallback(async () => {
    if (isNaN(txId) || txId <= 0) {
      setIs404(true);
      setError("Transaksi tidak ditemukan");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIs404(false);

    try {
      const data = await fetchTransactionDetail(txId);
      setDetail(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setIs404(true);
        setError("Transaksi tidak ditemukan");
      } else {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memuat detail transaksi.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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
                  <p className="text-[11px] text-muted -mt-0.5">Detail Transaksi</p>
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/transactions"
            className="
              inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
              bg-white/5 border border-glass-border text-foreground hover:bg-white/10
              transition-all active:scale-95
            "
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kembali ke Riwayat Transaksi
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-glass-border bg-surface p-8 space-y-6">
            <div className="h-6 w-48 bg-white/5 rounded-md animate-skeleton" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-skeleton" />
              ))}
            </div>
          </div>
        ) : is404 ? (
          <div className="rounded-2xl border border-glass-border bg-surface p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Transaksi Tidak Ditemukan</h2>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Maaf, transaksi dengan ID #{resolvedParams.id} tidak ada atau telah dihapus.
            </p>
            <Link
              href="/transactions"
              className="
                inline-block px-5 py-2.5 rounded-xl text-sm font-medium
                bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20
                transition-all active:scale-95 mt-2
              "
            >
              Lihat Semua Transaksi
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-glass-border bg-surface p-8 text-center space-y-4">
            <p className="text-sm font-medium text-rose-400">{error}</p>
            <button
              onClick={loadDetail}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-foreground transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : detail ? (
          <div className="rounded-2xl border border-glass-border bg-surface overflow-hidden shadow-xl space-y-6 p-6">
            {/* Title & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border pb-4 gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Detail Transaksi #{detail.id}
                </h2>
                <p className="text-xs text-muted mt-1">
                  Waktu: {formatDate(detail.createdAt)}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
                <span className="text-[11px] text-muted uppercase tracking-wider block">Total Bayar</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {formatRupiah(detail.total)}
                </span>
              </div>
            </div>

            {/* Snapshot Notice */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5V8.5M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>
                Nama dan harga item merupakan data historis (snapshot) saat transaksi diproses.
              </span>
            </div>

            {/* Items Table */}
            <div className="rounded-xl border border-glass-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-white/[0.03] border-b border-glass-border text-muted uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Produk (Snapshot)</th>
                      <th className="px-4 py-3 text-right">Harga</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border text-foreground">
                    {detail.items.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-3.5 font-medium">
                          {item.productNameSnapshot}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs text-muted">
                          {formatRupiah(item.priceSnapshot)}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium">
                          {item.qty}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-medium text-emerald-400">
                          {formatRupiah(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-glass-border py-4 mt-auto">
        <p className="text-center text-xs text-muted">
          Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
        </p>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
