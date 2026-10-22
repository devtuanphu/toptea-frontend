'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';

const OFFSET = 40;

/** On the shop page the header sits on the bottom edge of the banner: it is "scrolled" once it reaches the top. */
function isScrolled() {
  const shop = document.documentElement.hasAttribute('data-shop-banner');
  // A hidden (previously visited) shop page may still be in the DOM: take the one on screen.
  const banner = shop && [...document.querySelectorAll<HTMLElement>('.shop-banner__media')].find((el) => el.offsetHeight);
  const header = document.querySelector<HTMLElement>('.site-header');
  const offset = banner && header ? banner.offsetHeight - header.offsetHeight - 1 : OFFSET;
  return window.scrollY > offset;
}

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/**
 * Header sits over the hero, then sticks to the top with a solid bar once the page
 * is scrolled past 40px (same behaviour as top-well-1), or on the shop page once it reaches the top.
 */
export default function StickyHeader({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  // From here on the shop header layout follows the data-shop-banner flag instead of `:has()`.
  useEffect(() => document.documentElement.setAttribute('data-hydrated', ''), []);
  return <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>{children}</header>;
}
