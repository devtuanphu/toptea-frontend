'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { Field } from '@/components/sections/forms';
import { postJson } from '@/lib/client-api';
import { fill, formatDate, formatDateTime, formatPrice } from '@/lib/format';
import Rt from '@/components/ui/Rt';
import type { FormField } from '@/lib/types';

type Status = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

type Order = {
  code: string;
  status: Status;
  createdAt: string;
  customerName: string;
  district?: string;
  province?: string;
  carrier?: string;
  payment?: string;
  estimatedDelivery?: string;
  items: { slug: string; name: string; quantity: number; lineTotal: number; image?: string }[];
  total: number;
  history: { status: Status; at: string }[];
};

export type LookupLabels = {
  codeField: FormField;
  contactField: FormField;
  submitLabel?: string;
  notFoundMessage?: string;
  resultTitle?: string;
  itemsTitle?: string;
  deliveryTitle?: string;
  recipientLabel?: string;
  addressLabel?: string;
  carrierLabel?: string;
  paymentLabel?: string;
  totalLabel?: string;
  quantityLabel?: string;
  expectedLabel?: string;
  placedLabel?: string;
  confirmedLabel?: string;
  shippingLabel?: string;
  completedLabel?: string;
  cancelledLabel?: string;
  mobileResultTitle?: string;
};

const FLOW: Status[] = ['pending', 'confirmed', 'shipping', 'completed'];

export default function OrderLookup({ labels, currency }: { labels: LookupLabels; currency: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const statusLabel: Record<Status, string | undefined> = {
    pending: labels.placedLabel,
    confirmed: labels.confirmedLabel,
    shipping: labels.shippingLabel,
    completed: labels.completedLabel,
    cancelled: labels.cancelledLabel,
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError('');
    const res = await postJson<Order>('/api/orders/lookup', { code: form.get('code'), contact: form.get('contact') });
    setSending(false);
    if (res.ok && res.data?.code) setOrder(res.data);
    else {
      setOrder(null);
      setError(labels.notFoundMessage || '');
    }
  }

  const reached = order ? FLOW.indexOf(order.status) : -1;

  return (
    <>
      <div className="lookup">
        <form className="lookup__card" onSubmit={submit}>
          <Field field={labels.codeField} name="code" required maxLength={40} autoComplete="off" />
          <Field field={labels.contactField} name="contact" required maxLength={254} autoComplete="email" />
          <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
            {labels.submitLabel}
          </button>
          {error && (
            <p className="form-status form-status--error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>

      {order && (
        <section className="order-result" aria-live="polite">
          <div className="order-result__head">
            <h2 className="h3">
              <Rt
                d={fill(labels.resultTitle, { code: order.code })}
                m={labels.mobileResultTitle ? fill(labels.mobileResultTitle, { code: order.code }) : undefined}
              />
            </h2>
            <span className="badge">{statusLabel[order.status]}</span>
          </div>
          <ol className="timeline">
            {FLOW.map((step, i) => {
              const event = order.history.find((h) => h.status === step);
              const done = order.status !== 'cancelled' && i <= reached;
              const when = event
                ? formatDateTime(event.at)
                : step === 'completed' && order.estimatedDelivery
                  ? `${labels.expectedLabel} ${formatDate(order.estimatedDelivery).slice(0, 5)}`
                  : '';
              return (
                <li key={step} className={`timeline__step${done ? ' is-done' : ''}`}>
                  <span className="timeline__dot" aria-hidden="true" />
                  <span className="label">{statusLabel[step]}</span>
                  <span className="body-sm muted">{when}</span>
                </li>
              );
            })}
          </ol>
          <div className="order-result__details">
            <div className="order-result__items">
              <h3 className="h4">{labels.itemsTitle}</h3>
              <ul>
                {order.items.map((item) => (
                  <li key={item.slug} className="mini-line">
                    <span className="mini-line__thumb">
                      {item.image && <Image src={item.image} alt="" fill sizes="56px" unoptimized />}
                    </span>
                    <span className="mini-line__name">
                      <span className="body">{item.name}</span>
                      <span className="body-sm muted">
                        {labels.quantityLabel}: {item.quantity}
                      </span>
                    </span>
                    <span className="body">{formatPrice(item.lineTotal, currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <dl className="info-box info-box--compact">
              <p className="h4">{labels.deliveryTitle}</p>
              {[
                [labels.recipientLabel, order.customerName],
                [labels.addressLabel, [order.district, order.province].filter(Boolean).join(', ')],
                [labels.carrierLabel, order.carrier],
                [labels.paymentLabel, order.payment],
                [labels.totalLabel, formatPrice(order.total, currency)],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="info-box__row">
                    <dt className="label muted">{label}</dt>
                    <dd className="body-sm">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </section>
      )}
    </>
  );
}
