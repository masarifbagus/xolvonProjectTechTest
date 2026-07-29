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
          relative w-full max-w-2xl bg-white border-2 border-border
          rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]
          animate-slide-up
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">
              #
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-sm font-black text-text-primary uppercase tracking-wide flex items-center gap-2"
              >
                Detail Transaksi #{transactionId}
              </h2>
              {detail && (
                <p className="text-[11px] text-text-secondary font-semibold tabular-nums">
                  {formatDate(detail.createdAt)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-2 py-1 rounded text-xs font-semibold border border-border text-text-secondary hover:text-text-primary hover:bg-slate-200 transition-all flex items-center gap-1"
            aria-label="Tutup modal"
          >
            <span>Tutup</span>
            <kbd className="font-mono text-[10px] bg-white border px-1 rounded">Esc</kbd>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-6 space-y-4">
              <div className="h-4 w-48 bg-surface rounded animate-skeleton" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-surface rounded animate-skeleton"
                  />
                ))}
              </div>
              <div className="h-8 w-32 bg-surface rounded ml-auto mt-4 animate-skeleton" />
            </div>
          ) : error ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-xs font-bold text-danger">{error}</p>
              <button
                onClick={() => transactionId && loadDetail(transactionId)}
                className="px-3.5 py-1.5 rounded text-xs font-bold bg-white border border-border text-text-primary hover:bg-surface transition-all shadow-2xs"
              >
                Coba Lagi
              </button>
            </div>
          ) : detail ? (
            <>
              {/* Snapshot Info Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                <span className="font-bold">ℹ</span>
                <span>
                  Nama & harga item adalah data historis (snapshot) saat transaksi kasir berhasil dilakukan.
                </span>
              </div>

              {/* Items Table - High Density */}
              <div className="rounded border-2 border-border bg-white overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-surface border-b-2 border-border text-text-secondary uppercase text-[11px] font-extrabold tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Produk (Snapshot)</th>
                        <th className="px-4 py-2 text-right">Harga Satuan</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-text-primary">
                      {detail.items.map((item, idx) => (
                        <tr key={item.id ?? idx} className="even:bg-surface/50 hover:bg-slate-100/70 transition-colors">
                          <td className="px-4 py-2 font-bold">
                            {item.productNameSnapshot}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-text-secondary">
                            {formatRupiah(item.priceSnapshot)}
                          </td>
                          <td className="px-4 py-2 text-center tabular-nums font-black">
                            {item.qty}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums font-extrabold text-text-primary">
                            {formatRupiah(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transaction Total Banner */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-3.5 rounded bg-slate-100 border-2 border-border gap-2">
                <span className="text-xs text-text-secondary uppercase tracking-wider font-extrabold">
                  TOTAL PEMBAYARAN TRANSAKSI
                </span>
                <span className="text-xl font-black tabular-nums text-primary">
                  {formatRupiah(detail.total)}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="
              px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider
              bg-white hover:bg-slate-100 text-text-primary
              border border-border transition-all shadow-2xs
            "
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
