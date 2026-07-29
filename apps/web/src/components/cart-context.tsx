"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

// ─── Context Value ────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  updateQty: (productId: number, qty: number) => boolean;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  refreshStock: (products: Product[]) => void;
}

// ─── Context ──────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Tambah produk ke keranjang (increment qty jika sudah ada)
  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);

      if (existing) {
        // Cek stok sebelum tambah
        if (existing.qty >= product.stock) return prev;

        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      // Item baru
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock,
        },
      ];
    });
  }, []);

  // Update qty — return false jika melebihi stok
  const updateQty = useCallback((productId: number, qty: number): boolean => {
    let allowed = true;

    setItems((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (!item) return prev;

      if (qty > item.stock) {
        allowed = false;
        return prev;
      }

      if (qty <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }

      return prev.map((i) =>
        i.productId === productId ? { ...i, qty } : i
      );
    });

    return allowed;
  }, []);

  // Hapus item
  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  // Kosongkan keranjang
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Update data stok terbaru dari fetch products
  const refreshStock = useCallback((products: Product[]) => {
    setItems((prev) =>
      prev
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null; // produk sudah dihapus

          return {
            ...item,
            name: product.name,
            price: product.price,
            stock: product.stock,
            // Clamp qty jika stok turun
            qty: Math.min(item.qty, product.stock),
          };
        })
        .filter((item): item is CartItem => item !== null && item.qty > 0)
    );
  }, []);

  // Computed values
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      totalPrice,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      refreshStock,
    }),
    [items, totalItems, totalPrice, addToCart, updateQty, removeItem, clearCart, refreshStock]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
