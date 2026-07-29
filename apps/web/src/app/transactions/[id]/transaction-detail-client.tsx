"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import type { TransactionDetail } from "@/types/transaction";
import { fetchTransactionDetail, ApiError } from "@/lib/api";
import { formatRupiah, formatDate } from "@/lib/format";
import { useCart } from "@/components/cart-context";
import CartSidebar from "@/components/cart-sidebar";

interface TransactionClientProps {
  params: Promise<{ id: string }>;
}

export default function TransactionDetailClient({ params }: TransactionClientProps) {
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
                  <p className="text-[11px] text-text-secondary -mt-0.5">Detail Transaksi</p>
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/transactions"
            className="
              inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold
              bg-white border border-border text-text-primary hover:bg-surface
              transition-all active:scale-95 shadow-xs
            "
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kembali ke Riwayat Transaksi
          </Link>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-white p-6 space-y-4 shadow-xs">
            <div className="h-5 w-48 bg-surface rounded-md animate-skeleton" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-surface rounded-md animate-skeleton" />
              ))}
            </div>
          </div>
        ) : is404 ? (
          <div className="rounded-lg border border-border bg-white p-10 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-red-50 text-danger mx-auto flex items-center justify-center border border-red-100">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-base font-bold text-text-primary">Transaksi Tidak Ditemukan</h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Maaf, transaksi dengan ID #{resolvedParams.id} tidak ditemukan.
            </p>
            <Link
              href="/transactions"
              className="
                inline-block px-4 py-2 rounded-lg text-xs font-semibold
                bg-primary text-white hover:bg-primary-hover shadow-xs
                transition-all active:scale-95 mt-1
              "
            >
              Lihat Semua Transaksi
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="text-xs font-semibold text-danger">{error}</p>
            <button
              onClick={loadDetail}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-border text-text-primary hover:bg-surface transition-all shadow-xs"
            >
              Coba Lagi
            </button>
          </div>
        ) : detail ? (
          <div className="rounded-lg border border-border bg-white overflow-hidden shadow-xs space-y-5 p-6">
            {/* Title & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  Detail Transaksi #{detail.id}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                  Waktu Transaksi: {formatDate(detail.createdAt)}
                </p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-slate-50 border border-border text-right">
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold block">Total Bayar</span>
                <span className="text-base font-bold tabular-nums text-primary">
                  {formatRupiah(detail.total)}
                </span>
              </div>
            </div>

            {/* Snapshot Notice */}
            <div className="flex items-center gap-2.5 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-xs">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 5V8.5M8 11H8.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>
                Nama dan harga item merupakan data historis (snapshot) saat transaksi diproses.
              </span>
            </div>

            {/* Items Table */}
            <div className="rounded-md border border-border bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-border text-text-secondary uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Produk (Snapshot)</th>
                      <th className="px-4 py-2.5 text-right">Harga</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-text-primary">
                    {detail.items.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {item.productNameSnapshot}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                          {formatRupiah(item.priceSnapshot)}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums font-semibold">
                          {item.qty}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-bold text-text-primary">
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
      <footer className="border-t border-border bg-white py-4 mt-auto">
        <p className="text-center text-xs text-text-secondary">
          Mini POS &copy; {new Date().getFullYear()} — Xolvon Tech Test
        </p>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
