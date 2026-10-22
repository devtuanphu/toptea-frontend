'use client';

import { useEffect } from 'react';

/**
 * Marks <html data-shop-banner> while the shop banner is on screen; the header layout keys off it.
 * Not just `:has(.shop-banner)`: after leaving the shop, Next keeps the page mounted but hidden, so
 * the banner is still in the DOM. Effects do stop for hidden pages, which clears the flag. Before
 * hydration (nothing hidden yet) the CSS falls back to `:has()`, so the header doesn't jump.
 */
export default function ShopBannerFlag() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-shop-banner', '');
    window.dispatchEvent(new Event('scroll'));
    return () => {
      root.removeAttribute('data-shop-banner');
      window.dispatchEvent(new Event('scroll'));
    };
  }, []);
  return null;
}
