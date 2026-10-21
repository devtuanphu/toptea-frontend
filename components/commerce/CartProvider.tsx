'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

export type CartItem = {
  slug: string;
  quantity: number;
  // Snapshot for instant display; prices are always recalculated by the server.
  name: string;
  price: number;
  image?: string;
  category?: string;
};

type Snapshot = { items: CartItem[] };

type CartState = Snapshot & {
  ready: boolean;
  count: number;
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = 'twt-cart-v1';
const MAX_QTY = 99;
const EMPTY: Snapshot = { items: [] };

// ---- localStorage-backed store (one per tab, synced across tabs) ----
let current: Snapshot | null = null;
const listeners = new Set<() => void>();

function read(): Snapshot {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter((i: CartItem) => typeof i?.slug === 'string' && Number(i.quantity) > 0)
      : [];
    return { items };
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  if (!current) current = read();
  return current;
}

function update(next: (state: Snapshot) => Snapshot) {
  current = next(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Private mode or full storage: the cart still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = read();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

const noopSubscribe = () => () => {};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  // False during server render and hydration, true once the browser cart is readable.
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    update((s) => {
      const existing = s.items.find((i) => i.slug === item.slug);
      const items = existing
        ? s.items.map((i) =>
            i.slug === item.slug ? { ...i, ...item, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i,
          )
        : [...s.items, { ...item, quantity: Math.min(MAX_QTY, Math.max(1, quantity)) }];
      return { ...s, items };
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    update((s) => ({
      ...s,
      items:
        quantity < 1
          ? s.items.filter((i) => i.slug !== slug)
          : s.items.map((i) => (i.slug === slug ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
    }));
  }, []);

  const remove = useCallback((slug: string) => update((s) => ({ ...s, items: s.items.filter((i) => i.slug !== slug) })), []);
  const clear = useCallback(() => update(() => EMPTY), []);

  const value = useMemo<CartState>(
    () => ({
      ...state,
      ready,
      count: state.items.reduce((sum, i) => sum + i.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [state, ready, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
