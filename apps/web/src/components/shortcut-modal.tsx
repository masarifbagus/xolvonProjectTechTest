"use client";

interface ShortcutModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_LIST = [
  { key: "F1", desc: "Fokus ke pencarian produk" },
  { key: "F9", desc: "Buka / tutup sidebar keranjang" },
  { key: "F12", desc: "Proses checkout keranjang" },
  { key: "Esc", desc: "Tutup modal / sidebar aktif" },
  { key: "Ctrl + H", desc: "Navigasi ke Riwayat Transaksi" },
  { key: "Ctrl + P", desc: "Navigasi ke Manajemen Produk" },
];

export default function ShortcutModal({ open, onClose }: ShortcutModalProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panduan Keyboard Shortcut"
          className="
            pointer-events-auto w-full max-w-md bg-white border border-border
            rounded-lg shadow-xl overflow-hidden animate-slide-up
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs font-bold font-mono">
                ⌨
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Daftar Keyboard Shortcut Kasir
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-slate-200 transition-colors"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-2">
            <p className="text-[11px] text-text-secondary mb-3">
              Gunakan tombol keyboard di bawah ini untuk mempercepat transaksi kasir:
            </p>
            <div className="divide-y divide-border border border-border rounded-md overflow-hidden bg-white">
              {SHORTCUT_LIST.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-medium text-text-primary">
                    {item.desc}
                  </span>
                  <kbd className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-800 rounded shadow-2xs">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-surface border-t border-border flex justify-between items-center text-[11px] text-text-secondary">
            <span>Tekan <kbd className="font-mono bg-white border px-1.5 rounded text-slate-700">Esc</kbd> untuk menutup</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white border border-border text-xs font-semibold text-text-primary rounded hover:bg-slate-100 transition-all"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
