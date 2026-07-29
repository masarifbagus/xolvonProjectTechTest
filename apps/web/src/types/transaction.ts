export interface TransactionSummary {
  id: number;
  total: number;
  createdAt: string;
}

export interface TransactionItem {
  id?: number;
  productId?: number;
  productNameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
}

export interface TransactionDetail {
  id: number;
  total: number;
  createdAt: string;
  items: TransactionItem[];
}
