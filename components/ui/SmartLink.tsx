import Link from 'next/link';
import type { ReactNode } from 'react';
import { isExternal, safeHref } from '@/lib/media';

type Props = {
  href?: string | null;
  className?: string;
  children: ReactNode;
  newTab?: boolean;
  ariaLabel?: string;
  prefetch?: boolean;
};

/** next/link for internal paths, a plain anchor for external, mail and phone links. */
export default function SmartLink({ href, className, children, newTab, ariaLabel, prefetch }: Props) {
  const target = safeHref(href);
  if (isExternal(target)) {
    const opensTab = newTab || /^https?:/i.test(target);
    return (
      <a
        href={target}
        className={className}
        aria-label={ariaLabel}
        {...(opensTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={target} className={className} aria-label={ariaLabel} prefetch={prefetch}>
      {children}
    </Link>
  );
}
