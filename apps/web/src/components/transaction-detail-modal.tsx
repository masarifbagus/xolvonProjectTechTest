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
        className="fixed inset-0 bg-slate-900/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="
          relative w-full max-w-2xl bg-white border border-border
          rounded-lg shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]
          animate-slide-up
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
                className="text-sm font-bold text-text-primary flex items-center gap-2"
              >
                Detail Transaksi #{transactionId}
              </h2>
              {detail && (
                <p className="text-[11px] text-text-secondary tabular-nums">
                  {formatDate(detail.createdAt)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              p-1.5 rounded-md text-text-secondary hover:text-text-primary
              hover:bg-surface border border-transparent hover:border-border transition-all
            "
            aria-label="Tutup modal"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-6 space-y-4">
              <div className="h-4 w-48 bg-surface rounded-md animate-skeleton" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-surface rounded-md animate-skeleton"
                  />
                ))}
              </div>
              <div className="h-8 w-32 bg-surface rounded-md animate-skeleton ml-auto mt-4" />
            </div>
          ) : error ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-danger mx-auto flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-danger">{error}</p>
              <button
                onClick={() => transactionId && loadDetail(transactionId)}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-border text-text-primary hover:bg-surface transition-all shadow-xs"
              >
                Coba Lagi
              </button>
            </div>
          ) : detail ? (
            <>
              {/* Snapshot Info Notice */}
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

              {/* Transaction Total */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-3.5 rounded-md bg-slate-50 border border-border gap-2">
                <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                  Total Pembayaran
                </span>
                <span className="text-lg font-bold tabular-nums text-primary">
                  {formatRupiah(detail.total)}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border bg-white flex justify-end">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-md text-xs font-semibold
              bg-white hover:bg-surface text-text-primary
              border border-border transition-all shadow-xs
            "
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
