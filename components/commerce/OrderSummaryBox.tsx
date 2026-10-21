'use client';

import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { fill, formatPrice } from '@/lib/format';
import { LAST_ORDER_KEY } from './CheckoutView';
import Rt from '@/components/ui/Rt';

type LastOrder = { code: string; total: number; method?: string; payment: string; email: string };

export type BankTransfer = {
  methodCode?: string;
  title?: string;
  note?: string;
  qr?: ReactNode;
};

const noopSubscribe = () => () => {};
const readStored = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};

/** Order details shown on the thank-you page, read from this browser session only. */
export default function OrderSummaryBox({
  labels,
  currency,
  bank,
}: {
  labels: {
    orderCodeLabel?: string;
    mobileOrderCodeLabel?: string;
    totalLabel?: string;
    paymentLabel?: string;
    emailLabel?: string;
  };
  currency: string;
  bank?: BankTransfer;
}) {
  const raw = useSyncExternalStore(noopSubscribe, readStored, () => null);
  const order = useMemo<LastOrder | null>(() => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [raw]);

  if (!order) return null;
  // The mobile frame shows code, total and payment only.
  const rows: [ReactNode, string, string][] = [
    [<Rt key="c" d={labels.orderCodeLabel} m={labels.mobileOrderCodeLabel} />, `#${order.code}`, ''],
    [labels.totalLabel, formatPrice(order.total, currency), ''],
    [labels.paymentLabel, order.payment, ''],
    [labels.emailLabel, order.email, ' hide-mobile'],
  ];
  // Bank transfer: show the shop's QR; the shop confirms the payment by hand.
  const showBank = bank && order.method && order.method === bank.methodCode && (bank.qr || bank.note);
  return (
    <>
      <dl className="info-box">
        {rows.map(([label, value, extra], i) => (
          <div key={i} className={`info-box__row${extra}`}>
            <dt className="label muted">{label}</dt>
            <dd className="body">{value}</dd>
          </div>
        ))}
      </dl>
      {showBank && (
        <div className="info-box bank-box">
          {bank.qr && (
            <>
              {bank.title && <p className="h4">{bank.title}</p>}
              <div className="bank-box__qr">{bank.qr}</div>
            </>
          )}
          {bank.note && <p className="body-sm muted">{fill(bank.note, { code: order.code })}</p>}
        </div>
      )}
    </>
  );
}
