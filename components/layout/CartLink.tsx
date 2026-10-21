'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCart } from '@/components/commerce/CartProvider';

export default function CartLink({ label, icon }: { label: string; icon: ReactNode }) {
  const { count, ready } = useCart();
  return (
    <Link href="/gio-hang" className="site-header__icon site-header__cart" aria-label={ready && count ? `${label} (${count})` : label}>
      {icon}
      {ready && count > 0 && (
        <span className="site-header__badge" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
