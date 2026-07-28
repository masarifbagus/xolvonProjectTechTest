// ─── Product Type ──────────────────────────────────────────────
// Matches the API response from GET /products

export interface Product {
  id: number;
  name: string;
  price: number; // dalam Rupiah (integer)
  stock: number;
  isActive: number; // 0 | 1 (SQLite boolean)
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
}
