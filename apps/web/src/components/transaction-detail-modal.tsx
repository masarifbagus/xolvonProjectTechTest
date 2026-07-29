"use client";

import { useEffect, useState, useCallback } from "react";
import type { TransactionDetail } from "@/types/transaction";
import { fetchTransactionDetail } from "@/lib/api";
import { formatRupiah, formatDate } from "@/lib/format";

interface TransactionDetailModalProps {
  transactionId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({
  transactionId,
  open,
  onClose,
}: TransactionDetailModalProps) {
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactionDetail(id);
      setDetail(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat detail transaksi";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && transactionId) {
      loadDetail(transactionId);
    } else {
      setDetail(null);
      setError(null);
    }
  }, [open, transactionId, loadDetail]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="
          relative w-full max-w-2xl bg-surface border border-glass-border
          rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]
          animate-scale-up
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V5C17 3.89543 16.1046 3 15 3H13M7 3V5H13V3M7 3H13M7 9H13M7 13H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-lg font-semibold text-foreground flex items-center gap-2"
              >
                Detail Transaksi #{transactionId}
              </h2>
              {detail && (
                <p className="text-xs text-muted">
                  {formatDate(detail.createdAt)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              p-2 rounded-xl text-muted hover:text-foreground
              hover:bg-white/5 transition-all active:scale-95
            "
            aria-label="Tutup modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-8 space-y-4">
              <div className="h-4 w-48 bg-white/5 rounded-md animate-skeleton" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-white/5 rounded-xl animate-skeleton"
                  />
                ))}
              </div>
              <div className="h-8 w-32 bg-white/5 rounded-md animate-skeleton ml-auto mt-6" />
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-rose-400">{error}</p>
              <button
                onClick={() => transactionId && loadDetail(transactionId)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-foreground transition-all"
              >
                Coba Lagi
              </button>
            </div>
          ) : detail ? (
            <>
              {/* Snapshot Info Notice */}
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

              {/* Transaction Total */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-glass-border gap-2">
                <span className="text-xs text-muted uppercase tracking-wider font-medium">
                  Total Pembayaran
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatRupiah(detail.total)}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-glass-border bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="
              px-5 py-2 rounded-xl text-sm font-medium
              bg-white/5 hover:bg-white/10 text-foreground
              border border-glass-border transition-all active:scale-95
            "
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
