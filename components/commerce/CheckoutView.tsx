'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field } from '@/components/sections/forms';
import Rt, { mobileHidden } from '@/components/ui/Rt';
import { postJson } from '@/lib/client-api';
import { formatPrice } from '@/lib/format';
import type { ButtonItem, FormField } from '@/lib/types';
import { useCart } from './CartProvider';
import { SummaryTotals } from './CartView';
import { useQuote } from './useQuote';

export type PaymentMethod = {
  code: string;
  title: string;
  shortTitle?: string;
  description?: string;
  mobileTitle?: string;
  hideDescriptionOnMobile?: boolean;
};

export type CheckoutLabels = {
  contactTitle?: string;
  emailField: FormField;
  phoneField: FormField;
  shippingTitle?: string;
  nameField: FormField;
  addressField: FormField;
  provinceField: FormField;
  districtField: FormField;
  noteField: FormField;
  paymentTitle?: string;
  paymentMethods: PaymentMethod[];
  summaryTitle?: string;
  quantityLabel?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  totalLabel?: string;
  submitLabel?: string;
  termsNote?: string;
  emptyText?: string;
  emptyButton?: ButtonItem | null;
  errorMessage?: string;
  successUrl?: string;
  freeLabel?: string;
};

export const LAST_ORDER_KEY = 'twt-last-order';

export default function CheckoutView({ labels, currency }: { labels: CheckoutLabels; currency: string }) {
  const cart = useCart();
  const router = useRouter();
  const { quote, confirmed } = useQuote();
  const [payment, setPayment] = useState(labels.paymentMethods[0]?.code || 'cod');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const price = (value: number) => formatPrice(value, currency);

  if (!cart.ready) return <div className="cart-skeleton" aria-busy="true" />;
  if (!cart.items.length)
    return (
      <div className="cart-empty">
        <p className="body muted">{labels.emptyText}</p>
        {labels.emptyButton?.label && (
          <Link href={labels.emptyButton.url} className={`btn btn--${labels.emptyButton.variant || 'primary'}`}>
            {labels.emptyButton.label}
          </Link>
        )}
      </div>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSending(true);
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await postJson<{ code: string; total: number; paymentMethod: string; email: string }>('/api/orders', {
      ...form,
      paymentMethod: payment,
      items: cart.items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
    });
    if (!res.ok || !res.data?.code) {
      setSending(false);
      setError(labels.errorMessage || '');
      return;
    }
    const method = labels.paymentMethods.find((m) => m.code === res.data!.paymentMethod);
    try {
      sessionStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({
          code: res.data.code,
          total: res.data.total,
          method: res.data.paymentMethod,
          payment: method?.shortTitle || method?.title || res.data.paymentMethod,
          email: res.data.email,
        }),
      );
    } catch {
      // The success page simply omits the summary when storage is unavailable.
    }
    cart.clear();
    router.push(`${labels.successUrl || '/dat-hang-thanh-cong'}?ma=${encodeURIComponent(res.data.code)}`);
  }

  return (
    <form className="checkout" onSubmit={submit}>
      <div className="checkout__form">
        <fieldset className="checkout__group">
          <legend className="h4">{labels.contactTitle}</legend>
          <div className="field-row">
            <Field field={labels.emailField} name="email" type="email" required autoComplete="email" maxLength={254} />
            <Field field={labels.phoneField} name="phone" type="tel" required autoComplete="tel" maxLength={20} />
          </div>
        </fieldset>
        <fieldset className="checkout__group">
          <legend className="h4">{labels.shippingTitle}</legend>
          <Field field={labels.nameField} name="customerName" required autoComplete="name" maxLength={100} />
          <Field field={labels.addressField} name="address" required autoComplete="street-address" maxLength={300} />
          <div className="field-row">
            <Field field={labels.provinceField} name="province" required autoComplete="address-level1" maxLength={100} />
            <Field field={labels.districtField} name="district" autoComplete="address-level2" maxLength={100} />
          </div>
          <Field field={labels.noteField} name="note" maxLength={1000} />
        </fieldset>
        <fieldset className="checkout__group">
          <legend className="h4">{labels.paymentTitle}</legend>
          {labels.paymentMethods.map((m) => (
            <label key={m.code} className={`pay-option${payment === m.code ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethodChoice"
                value={m.code}
                checked={payment === m.code}
                onChange={() => setPayment(m.code)}
              />
              <span className="pay-option__radio" aria-hidden="true" />
              <span className="pay-option__text">
                <span className="body">
                  <Rt d={m.title} m={m.mobileTitle} />
                </span>
                {m.description && (
                  <span className={`body-sm muted${mobileHidden(m.hideDescriptionOnMobile)}`}>{m.description}</span>
                )}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="summary summary--checkout" aria-label={labels.summaryTitle}>
        <h2 className="h4">{labels.summaryTitle}</h2>
        <ul className="summary__items">
          {quote.lines.map((line) => (
            <li key={line.slug}>
              <span className="summary__thumb">
                {line.image && <Image src={line.image} alt="" fill sizes="56px" unoptimized />}
              </span>
              <span className="summary__name">
                <span>{line.name}</span>
                <span className="muted">
                  {labels.quantityLabel}: {line.quantity}
                </span>
              </span>
              <span>{price(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <SummaryTotals quote={quote} labels={labels} price={price} confirmed={confirmed} />
        <button type="submit" className="btn btn--primary btn--block" disabled={sending || !confirmed}>
          {labels.submitLabel}
        </button>
        {error && (
          <p className="form-status form-status--error" role="alert">
            {error}
          </p>
        )}
        {labels.termsNote && <p className="body-sm muted summary__terms">{labels.termsNote}</p>}
      </aside>
    </form>
  );
}
