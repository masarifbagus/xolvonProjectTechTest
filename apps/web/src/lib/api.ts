import type { Product, ProductFormData } from "@/types/product";
import type { CheckoutResponse } from "@/types/cart";
import type { TransactionSummary, TransactionDetail } from "@/types/transaction";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mini-pos-api.mas-arifbagus2407.workers.dev";

// ─── Error helper ─────────────────────────────────────────────

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request gagal (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // response body bukan JSON — gunakan pesan default
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

// ─── Product API ──────────────────────────────────────────────

/** Fetch semua produk */
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    cache: "no-store",
  });
  return handleResponse<Product[]>(res);
}

/** Buat produk baru */
export async function createProduct(data: ProductFormData): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

/** Update produk (partial update) */
export async function updateProduct(
  id: number,
  data: Partial<ProductFormData>
): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

/** Toggle status aktif/nonaktif */
export async function toggleProductStatus(
  id: number,
  isActive: boolean
): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  return handleResponse<Product>(res);
}

// ─── Checkout API ─────────────────────────────────────────────

/** Proses checkout — kirim hanya productId & qty, BUKAN harga */
export async function checkout(
  items: { productId: number; qty: number }[]
): Promise<CheckoutResponse> {
  const res = await fetch(`${API_URL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return handleResponse<CheckoutResponse>(res);
}

// ─── Transaction API ──────────────────────────────────────────

/** Fetch list semua transaksi */
export async function fetchTransactions(): Promise<TransactionSummary[]> {
  const res = await fetch(`${API_URL}/transactions`, {
    cache: "no-store",
  });
  return handleResponse<TransactionSummary[]>(res);
}

/** Fetch detail satu transaksi */
export async function fetchTransactionDetail(
  id: number
): Promise<TransactionDetail> {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    cache: "no-store",
  });
  return handleResponse<TransactionDetail>(res);
}

