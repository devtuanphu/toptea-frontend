import type { Metadata } from 'next';
import type { Global, MediaFile, Seo } from './types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010').replace(/\/$/, '');

export const absoluteUrl = (path = '/') => new URL(path, SITE_URL).href;

/** Public URL for uploads; `/uploads/*` is served through this site (see next.config rewrites). */
export function publicMediaUrl(file?: MediaFile | null) {
  if (!file?.url) return undefined;
  try {
    const path = file.url.startsWith('/') ? file.url : new URL(file.url).pathname;
    return absoluteUrl(path);
  } catch {
    return undefined;
  }
}

type BuildInput = {
  seo?: Seo;
  title: string;
  description?: string;
  path: string;
  image?: MediaFile | null;
  global?: Global | null;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
};

/** Title, description, canonical, robots, Open Graph and Twitter tags from CMS SEO fields. */
export function buildMetadata({
  seo,
  title,
  description,
  path,
  image,
  global,
  type = 'website',
  publishedTime,
  modifiedTime,
}: BuildInput): Metadata {
  const fallback = global?.defaultSeo;
  const metaTitle = seo?.metaTitle || title;
  const metaDescription = seo?.metaDescription || description || fallback?.metaDescription || '';
  const canonical = seo?.canonicalUrl || absoluteUrl(path);
  const share = publicMediaUrl(seo?.shareImage || image || fallback?.shareImage);
  const noIndex = Boolean(seo?.noIndex);
  return {
    title: { absolute: metaTitle },
    description: metaDescription,
    keywords: seo?.keywords || fallback?.keywords,
    alternates: { canonical },
    robots: { index: !noIndex, follow: !noIndex },
    openGraph: {
      type,
      url: canonical,
      siteName: global?.siteName,
      locale: 'vi_VN',
      title: metaTitle,
      description: metaDescription,
      ...(share ? { images: [{ url: share, alt: metaTitle }] } : {}),
      ...(type === 'article' ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      ...(share ? { images: [share] } : {}),
    },
  };
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
