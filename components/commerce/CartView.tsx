'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/format';
import type { ButtonItem } from '@/lib/types';
import { useCart } from './CartProvider';
import { useQuote } from './useQuote';

export type CartLabels = {
  productColumnLabel?: string;
  totalColumnLabel?: string;
  unitPriceLabel?: string;
  continueLabel?: string;
  continueUrl?: string;
  summaryTitle?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  totalLabel?: string;
  checkoutLabel?: string;
  checkoutUrl?: string;
  freeShippingNote?: string;
  freeLabel?: string;
  emptyTitle?: string;
  emptyText?: string;
  emptyButton?: ButtonItem | null;
  removeLabel?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
};

type Icons = { minus: ReactNode; plus: ReactNode; close: ReactNode; back: ReactNode };

export function QuantityControl({
  value,
  onChange,
  icons,
  decreaseLabel,
  increaseLabel,
  small,
}: {
  value: number;
  onChange: (value: number) => void;
  icons: Pick<Icons, 'minus' | 'plus'>;
  decreaseLabel?: string;
  increaseLabel?: string;
  small?: boolean;
}) {
  return (
    <div className={`qty${small ? ' qty--small' : ''}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label={decreaseLabel} disabled={value <= 1 && !small}>
        {icons.minus}
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(99, value + 1))} aria-label={increaseLabel}>
        {icons.plus}
      </button>
    </div>
  );
}

export default function CartView({ labels, currency, icons }: { labels: CartLabels; currency: string; icons: Icons }) {
  const cart = useCart();
  const { quote, confirmed } = useQuote();

  const price = (value: number) => formatPrice(value, currency);

  if (!cart.ready) return <div className="cart-skeleton" aria-busy="true" />;

  if (!cart.items.length)
    return (
      <div className="cart-empty">
        <h2 className="h3">{labels.emptyTitle}</h2>
        {labels.emptyText && <p className="body muted">{labels.emptyText}</p>}
        {labels.emptyButton?.label && (
          <Link href={labels.emptyButton.url} className={`btn btn--${labels.emptyButton.variant || 'primary'}`}>
            {labels.emptyButton.label}
          </Link>
        )}
      </div>
    );

  return (
    <div className="cart">
      <div className="cart__items">
        <div className="cart__head label muted" aria-hidden="true">
          <span>{labels.productColumnLabel}</span>
          <span>{labels.totalColumnLabel}</span>
        </div>
        <ul className="cart__list">
          {quote.lines.map((line) => (
            <li key={line.slug} className="cart-row">
              <Link href={`/cua-hang/${line.slug}`} className="cart-row__thumb">
                {line.image && <Image src={line.image} alt={line.name} fill sizes="96px" unoptimized />}
              </Link>
              <div className="cart-row__info">
                {line.category && <p className="eyebrow">{line.category}</p>}
                <Link href={`/cua-hang/${line.slug}`} className="h4">
                  {line.name}
                </Link>
                <p className="body-sm muted">
                  {labels.unitPriceLabel}: {price(line.price)}
                </p>
              </div>
              <QuantityControl
                small
                value={line.quantity}
                onChange={(q) => cart.setQuantity(line.slug, q)}
                icons={icons}
                decreaseLabel={labels.decreaseLabel}
                increaseLabel={labels.increaseLabel}
              />
              <p className="price cart-row__total">{price(line.lineTotal)}</p>
              <button
                type="button"
                className="cart-row__remove"
                onClick={() => cart.remove(line.slug)}
                aria-label={`${labels.removeLabel || ''} ${line.name}`.trim()}
              >
                {icons.close}
              </button>
            </li>
          ))}
        </ul>
        {labels.continueLabel && (
          <Link href={labels.continueUrl || '/cua-hang'} className="text-link cart__continue">
            <span className="flip">{icons.back}</span>
            {labels.continueLabel}
          </Link>
        )}
      </div>

      <aside className="summary" aria-label={labels.summaryTitle}>
        <h2 className="h4">{labels.summaryTitle}</h2>
        <SummaryTotals quote={quote} labels={labels} price={price} confirmed={confirmed} />
        <Link
          href={labels.checkoutUrl || '/thanh-toan'}
          className="btn btn--primary btn--block"
          aria-disabled={quote.missing.length > 0}
        >
          {labels.checkoutLabel}
        </Link>
        {labels.freeShippingNote && <p className="body-sm muted">{labels.freeShippingNote}</p>}
      </aside>
    </div>
  );
}

export function SummaryTotals({
  quote,
  labels,
  price,
  confirmed,
}: {
  quote: ReturnType<typeof useQuote>['quote'];
  labels: Pick<CartLabels, 'subtotalLabel' | 'shippingLabel' | 'totalLabel' | 'freeLabel'>;
  price: (value: number) => string;
  confirmed: boolean;
}) {
  return (
    <div className={`summary__totals${confirmed ? '' : ' is-pending'}`} aria-busy={!confirmed}>
      <hr />
      <p className="summary__line">
        <span className="muted">{labels.subtotalLabel}</span>
        <span>{price(quote.subtotal)}</span>
      </p>
      <p className="summary__line">
        <span className="muted">{labels.shippingLabel}</span>
        <span>{confirmed && quote.shippingFee === 0 ? labels.freeLabel || price(0) : price(quote.shippingFee)}</span>
      </p>
      <hr />
      <p className="summary__line summary__line--total">
        <span className="label">{labels.totalLabel}</span>
        <span className="price">{price(quote.total)}</span>
      </p>
    </div>
  );
}
