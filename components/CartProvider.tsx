"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number, product?: { name: string; price: number; image: string; sellerId?: string }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "shop_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    // Normalize: dedupe by productId (keep last), ensure quantity >= 1, valid shape
    const byId = new Map<string, CartItem>();
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object" || typeof (entry as CartItem).productId !== "string")
        continue;
      const item = entry as CartItem;
      const qty = Math.max(1, Math.floor(Number(item.quantity)) || 1);
      byId.set(item.productId, {
        productId: item.productId,
        sellerId: typeof item.sellerId === "string" ? item.sellerId : undefined,
        quantity: qty,
        name: typeof item.name === "string" ? item.name : undefined,
        price: typeof item.price === "number" ? item.price : undefined,
        image: typeof item.image === "string" ? item.image : undefined,
      });
    }
    return Array.from(byId.values());
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addItem = useCallback(
    (productId: string, quantity = 1, product?: { name: string; price: number; image: string; sellerId?: string }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            productId,
            sellerId: product?.sellerId,
            quantity,
            name: product?.name,
            price: product?.price,
            image: product?.image,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
