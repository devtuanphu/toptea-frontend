'use client';

import { useEffect, useState } from 'react';
import { postJson } from '@/lib/client-api';
import { useCart } from './CartProvider';

export type QuoteLine = {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  missing: string[];
};

/** Server-calculated prices for the current cart (falls back to the local snapshot while loading). */
export function useQuote() {
  const { items, ready } = useCart();
  // The response is stored with the cart it was computed for, so stale quotes are never shown.
  const [result, setResult] = useState<{ key: string; quote: Quote } | null>(null);
  const key = JSON.stringify(items.map((i) => [i.slug, i.quantity]));

  useEffect(() => {
    if (!ready || !items.length) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const res = await postJson<Quote>('/api/cart/quote', {
        items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      });
      if (!cancelled && res.ok && res.data) setResult({ key, quote: res.data });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `key` captures every input that matters (slugs and quantities).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  const confirmedQuote = result?.key === key ? result.quote : null;

  const fallback: Quote = {
    lines: items.map((i) => ({
      slug: i.slug,
      name: i.name,
      category: i.category || '',
      image: i.image || '',
      price: i.price,
      quantity: i.quantity,
      lineTotal: i.price * i.quantity,
    })),
    subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    shippingFee: 0,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    missing: [],
  };

  return {
    quote: confirmedQuote || fallback,
    confirmed: Boolean(confirmedQuote),
    loading: items.length > 0 && !confirmedQuote,
  };
}
