// ─── Cart Types ───────────────────────────────────────────────

/** Item dalam keranjang belanja (state frontend) */
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
  stock: number; // stok terakhir dari fetch, untuk validasi UX
}

// ─── Checkout Types ───────────────────────────────────────────

/** Response sukses dari POST /checkout (201) */
export interface CheckoutResponse {
  id: number;
  total: number;
  items: CheckoutResponseItem[];
  createdAt: string;
}

/** Item dalam response checkout — harga snapshot dari server */
export interface CheckoutResponseItem {
  productId: number;
  productName: string;
  qty: number;
  price: number; // harga snapshot saat transaksi
  subtotal: number;
}
