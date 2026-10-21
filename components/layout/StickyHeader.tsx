'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const OFFSET = 40;

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/**
 * Header sits over the hero, then sticks to the top with a solid bar once the page
 * is scrolled past 40px (same behaviour as top-well-1).
 */
export default function StickyHeader({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, () => window.scrollY > OFFSET, () => false);
  return <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>{children}</header>;
}
