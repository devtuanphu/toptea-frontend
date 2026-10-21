'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ButtonItem, LinkItem } from '@/lib/types';

type Props = {
  openLabel: string;
  closeLabel: string;
  menuIcon: ReactNode;
  closeIcon: ReactNode;
  brand: ReactNode;
  chevron: ReactNode;
  nav: LinkItem[];
  linesTitle?: string;
  lines: LinkItem[];
  cta?: ButtonItem | null;
  contacts: { label: string; url: string }[];
  socials: { label: string; url: string; icon: ReactNode }[];
};

/** Full-screen navigation drawer for small screens (Figma "Menu Drawer / Mobile"). */
export default function MobileMenu(props: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab' || !panelRef.current) return;
      // Keep keyboard focus inside the open drawer.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a, button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="site-header__icon site-header__menu"
        aria-label={props.openLabel}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        {props.menuIcon}
      </button>
      <div
        id="mobile-menu"
        ref={panelRef}
        className={`drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={props.openLabel}
        hidden={!open}
      >
        <div className="drawer__top">
          <Link href="/" className="drawer__brand">
            {props.brand}
          </Link>
          <button type="button" className="drawer__close" aria-label={props.closeLabel} onClick={() => setOpen(false)}>
            {props.closeIcon}
          </button>
        </div>
        <nav className="drawer__nav" aria-label={props.openLabel}>
          {props.nav.map((item, i) => (
            <Link key={item.id ?? i} href={item.url} className="drawer__link">
              <span>{item.label}</span>
              {props.chevron}
            </Link>
          ))}
        </nav>
        {props.lines.length > 0 && (
          <div className="drawer__lines">
            {props.linesTitle && <p className="eyebrow">{props.linesTitle}</p>}
            {props.lines.map((item, i) => (
              <Link key={item.id ?? i} href={item.url}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
        <div className="drawer__bottom">
          {props.cta?.label && (
            <Link href={props.cta.url} className={`btn btn--${props.cta.variant || 'light'} btn--block`}>
              {props.cta.label}
            </Link>
          )}
          <div className="drawer__contacts">
            {props.contacts.map((c) => (
              <a key={c.url} href={c.url}>
                {c.label}
              </a>
            ))}
          </div>
          <div className="social">
            {props.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
