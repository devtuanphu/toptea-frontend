'use client';

import type { ReactNode } from 'react';
import { useIsMobile } from '@/lib/use-mobile';

/** Accordion item whose initial open state can differ on phones (CMS "Đóng trên mobile"). */
export default function FaqItem({
  className,
  open,
  closeOnMobile,
  children,
}: {
  className: string;
  open?: boolean;
  closeOnMobile?: boolean;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <details className={className} open={Boolean(open) && !(isMobile && closeOnMobile)}>
      {children}
    </details>
  );
}
