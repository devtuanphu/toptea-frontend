import type { MetadataRoute } from 'next';
import { articleHref, productHref } from '@/lib/routes';
import { getArticles, getPage, getProducts, type PageType } from '@/lib/cms';
import { absoluteUrl } from '@/lib/seo';

// Indexable CMS pages and their routes.
const PAGES: [PageType, string, number][] = [
  ['home-page', '/', 1],
  ['shop-page', '/cua-hang', 0.9],
  ['about-page', '/ve-chung-toi', 0.7],
  ['blog-page', '/blog', 0.8],
  ['contact-page', '/lien-he', 0.6],
  ['order-tracking-page', '/tra-cuu-don-hang', 0.3],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, products, articles] = await Promise.all([
    Promise.all(PAGES.map(([type]) => getPage(type))),
    getProducts(),
    getArticles(),
  ]);
  return [
    ...PAGES.flatMap(([, path, priority], i) =>
      pages[i] && !pages[i]?.seo?.noIndex
        ? [{ url: absoluteUrl(path), lastModified: pages[i]?.updatedAt, changeFrequency: 'weekly' as const, priority }]
        : [],
    ),
    ...products
      .filter((p) => !p.seo?.noIndex)
      .map((p) => ({ url: absoluteUrl(productHref(p.slug)), lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...articles
      .filter((a) => !a.seo?.noIndex)
      .map((a) => ({ url: absoluteUrl(articleHref(a.slug)), lastModified: a.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
