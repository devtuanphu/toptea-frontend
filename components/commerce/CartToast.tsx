'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { fill, formatPrice } from '@/lib/format';

export type CartToastLabels = {
  message?: string;
  countTemplate?: string;
  viewCartLabel?: string;
  checkoutLabel?: string;
  closeLabel?: string;
};

type Props = {
  item: { name: string; price: number; image?: string; category?: string };
  quantity: number;
  count: number;
  currency: string;
  labels: CartToastLabels;
  icons: { check?: ReactNode; close?: ReactNode };
  onClose: () => void;
};

/**
 * "Added to cart" card. It hides itself when the progress bar finishes (4s, paused on
 * hover or keyboard focus), on Escape, or when a link is followed.
 */
export default function CartToast({ item, quantity, count, currency, labels, icons, onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="cart-toast" role="status" aria-live="polite">
      <div className="cart-toast__head">
        <span className="cart-toast__check" aria-hidden="true">
          {icons.check}
        </span>
        <p className="cart-toast__title">{labels.message}</p>
        <button type="button" className="cart-toast__close" aria-label={labels.closeLabel} onClick={onClose}>
          {icons.close}
        </button>
      </div>
      <div className="cart-toast__item">
        <span className="cart-toast__thumb">
          {item.image && <Image src={item.image} alt="" fill sizes="64px" unoptimized />}
        </span>
        <span className="cart-toast__info">
          {item.category && <span className="cart-toast__category">{item.category}</span>}
          <span className="cart-toast__name">{item.name}</span>
          <span className="cart-toast__meta">
            {quantity} × {formatPrice(item.price, currency)}
          </span>
        </span>
      </div>
      {labels.countTemplate && <p className="cart-toast__count">{fill(labels.countTemplate, { count: String(count) })}</p>}
      <div className="cart-toast__actions">
        <Link href="/gio-hang" className="btn btn--secondary btn--small" onClick={onClose}>
          {labels.viewCartLabel}
        </Link>
        <Link href="/thanh-toan" className="btn btn--primary btn--small" onClick={onClose}>
          {labels.checkoutLabel}
        </Link>
      </div>
      <span className="cart-toast__progress" aria-hidden="true" onAnimationEnd={onClose} />
    </div>,
    document.body,
  );
}
