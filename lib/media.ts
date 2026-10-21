import type { MediaFile, Picture } from './types';

const STRAPI_PUBLIC_URL = process.env.STRAPI_URL || 'http://localhost:1340';

/** Absolute URL for an uploaded file (used by next/image and Open Graph tags). */
export function mediaUrl(file?: MediaFile | null): string {
  const url = file?.url || '';
  if (!url) return '';
  return url.startsWith('/') ? `${STRAPI_PUBLIC_URL}${url}` : url;
}

/**
 * Same-origin path for icons. `/uploads/*` is proxied to Strapi by a rewrite,
 * which lets CSS masks recolor SVG icons uploaded in the CMS.
 */
export function iconUrl(file?: MediaFile | null): string {
  const url = file?.url || '';
  if (!url) return '';
  try {
    return url.startsWith('/') ? url : new URL(url).pathname;
  } catch {
    return '';
  }
}

export function pictureAlt(picture: Picture, fallback = ''): string {
  return picture?.alt || picture?.media?.alternativeText || fallback;
}

/** Allow only safe link targets coming from the CMS. */
export function safeHref(href?: string | null): string {
  if (!href) return '/';
  const value = href.trim();
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:[+0-9(). -]+$/i.test(value)) return value;
  return '/';
}

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/i.test(href);
