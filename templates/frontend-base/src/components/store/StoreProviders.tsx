"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { TemplateProduct } from "@/templates/types";

/* ---------- Base path: keeps product links inside the current theme site ---------- */

const BasePathContext = createContext("");

/** "" for the main store, "/themes/<id>" for a theme's own site. */
export function useStoreBasePath() {
  return useContext(BasePathContext);
}

/* ---------- Demo cart: one per theme, kept in this browser only ---------- */

export type CartLine = { product: TemplateProduct; quantity: number };

type CartContextValue = {
  /** False until the saved cart has been read, so the first render matches the server. */
  ready: boolean;
  lines: CartLine[];
  count: number;
  subtotalMinor: number;
  addItem: (product: TemplateProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/** Cart state for the current theme. Throws if used outside StoreProviders. */
export function useDemoCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useDemoCart must be used inside StoreProviders");
  return value;
}

/** Saved cart line. The product is stored as a snapshot, so the cart works for any catalogue. */
type StoredItem = { id: string; quantity: number; product: TemplateProduct };

function storageKey(themeId: string) {
  return `storeblocks-cart-${themeId}`;
}

function readStored(themeId: string): StoredItem[] {
  try {
    const raw = window.localStorage.getItem(storageKey(themeId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredItem).id === "string" &&
        typeof (item as StoredItem).quantity === "number" &&
        typeof (item as StoredItem).product?.priceMinor === "number"
    );
  } catch {
    // Storage can be blocked or the value corrupt. Start with an empty cart.
    return [];
  }
}

function writeStored(themeId: string, items: StoredItem[]) {
  try {
    window.localStorage.setItem(storageKey(themeId), JSON.stringify(items));
  } catch {
    // Ignore storage errors; the cart still works for this visit.
  }
}

/** Quantity is at least 1 and never above the product's stock (when stock is known). */
function clampQuantity(quantity: number, product: TemplateProduct | undefined) {
  const max = product?.stock !== undefined && product.stock > 0 ? product.stock : 99;
  return Math.min(Math.max(Math.floor(quantity), 1), max);
}

export function StoreProviders({
  basePath,
  themeId,
  children
}: {
  basePath: string;
  themeId: string;
  children: React.ReactNode;
}) {
  const [stored, setStored] = useState<StoredItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(readStored(themeId));
    setReady(true);
  }, [themeId]);

  const commit = useCallback(
    (next: StoredItem[]) => {
      setStored(next);
      writeStored(themeId, next);
    },
    [themeId]
  );

  const lines = useMemo<CartLine[]>(
    () => stored.map((item) => ({ product: item.product, quantity: clampQuantity(item.quantity, item.product) })),
    [stored]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      ready,
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotalMinor: lines.reduce((sum, line) => sum + line.product.priceMinor * line.quantity, 0),
      addItem: (product, quantity = 1) => {
        const current = stored.find((item) => item.id === product.id);
        const nextQty = clampQuantity((current?.quantity ?? 0) + quantity, product);
        commit(
          current
            ? stored.map((item) => (item.id === product.id ? { ...item, quantity: nextQty } : item))
            : [...stored, { id: product.id, quantity: nextQty, product }]
        );
      },
      setQuantity: (productId, quantity) => {
        commit(
          stored.map((item) => (item.id === productId ? { ...item, quantity: clampQuantity(quantity, item.product) } : item))
        );
      },
      removeItem: (productId) => commit(stored.filter((item) => item.id !== productId)),
      clear: () => commit([])
    }),
    [ready, lines, stored, commit]
  );

  return (
    <BasePathContext.Provider value={basePath}>
      <CartContext.Provider value={value}>{children}</CartContext.Provider>
    </BasePathContext.Provider>
  );
}
