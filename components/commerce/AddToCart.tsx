'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useCart, type CartItem } from './CartProvider';
import { QuantityControl } from './CartView';
import CartToast, { type CartToastLabels } from './CartToast';

export default function AddToCart({
  item,
  label,
  addedLabel,
  decreaseLabel,
  increaseLabel,
  icons,
  toast,
  currency = '₫',
  disabled,
}: {
  item: Omit<CartItem, 'quantity'>;
  label: string;
  addedLabel?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  icons: { minus: ReactNode; plus: ReactNode; check?: ReactNode; close?: ReactNode };
  toast?: CartToastLabels;
  currency?: string;
  disabled?: boolean;
}) {
  const { add, count } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  // `id` remounts the toast so a second click restarts its timer.
  const [shown, setShown] = useState<{ id: number; quantity: number } | null>(null);
  const hide = useCallback(() => setShown(null), []);

  return (
    <div className="buy">
      <QuantityControl
        value={quantity}
        onChange={(q) => setQuantity(Math.max(1, q))}
        icons={icons}
        decreaseLabel={decreaseLabel}
        increaseLabel={increaseLabel}
      />
      <button
        type="button"
        className="btn btn--primary buy__button"
        disabled={disabled}
        onClick={() => {
          add(item, quantity);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2500);
          if (toast) setShown({ id: Date.now(), quantity });
        }}
      >
        <span aria-live={toast ? undefined : 'polite'}>{added && addedLabel ? addedLabel : label}</span>
      </button>
      {shown && toast && (
        <CartToast
          key={shown.id}
          item={item}
          quantity={shown.quantity}
          count={count}
          currency={currency}
          labels={toast}
          icons={{ check: icons.check, close: icons.close }}
          onClose={hide}
        />
      )}
    </div>
  );
}
