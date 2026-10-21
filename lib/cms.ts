import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type {
  Article,
  ArticlePageConfig,
  FooterConfig,
  Global,
  HeaderConfig,
  IconSet,
  Page,
  Product,
  ProductPageConfig,
  SiteContext,
  SiteSettings,
  Taxonomy,
} from './types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1340';

/** Tag used by every CMS read; `/api/revalidate` clears it when Strapi publishes. */
export const CMS_TAG = 'cms';

async function request<T>(path: string): Promise<T | null> {
  const res = await fetch(`${STRAPI_URL}/api/site/${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Strapi responded ${res.status} for /api/site/${path}`);
  return ((await res.json()) as { data: T }).data;
}

// Content is cached and refreshed every minute, or immediately via the revalidate webhook.
async function cached<T>(path: string): Promise<T | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CMS_TAG);
  return request<T>(path);
}

export type PageType =
  | 'home-page'
  | 'about-page'
  | 'shop-page'
  | 'blog-page'
  | 'contact-page'
  | 'cart-page'
  | 'checkout-page'
  | 'thank-you-page'
  | 'order-tracking-page'
  | 'search-page'
  | 'not-found-page';

export const getPage = (type: PageType) => cached<Page>(`page/${type}`);
export const getGlobal = () => cached<Global>('page/global');
export const getHeader = () => cached<HeaderConfig>('page/header');
export const getFooter = () => cached<FooterConfig>('page/footer');
export const getIcons = async () => (await cached<IconSet>('page/icon-set')) || {};
export const getSettings = async () => (await cached<SiteSettings>('page/site-settings')) || {};
export const getProductPageConfig = () => cached<ProductPageConfig>('page/product-page');
export const getArticlePageConfig = () => cached<ArticlePageConfig>('page/article-page');

export const getProducts = async () => (await cached<Product[]>('products')) || [];
export const getProduct = (slug: string) => cached<Product>(`products/${encodeURIComponent(slug)}`);
export const getArticles = async () => (await cached<Article[]>('articles')) || [];
export const getArticle = (slug: string) => cached<Article>(`articles/${encodeURIComponent(slug)}`);
export const getProductCategories = async () => (await cached<Taxonomy[]>('product-categories')) || [];
export const getBrewMethods = async () => (await cached<Taxonomy[]>('brew-methods')) || [];
export const getArticleCategories = async () => (await cached<Taxonomy[]>('article-categories')) || [];

export async function searchSite(query: string) {
  'use cache';
  cacheLife('minutes');
  cacheTag(CMS_TAG);
  const data = await request<{ query: string; products: Product[]; articles: Article[] }>(
    `search?q=${encodeURIComponent(query)}`,
  );
  return data || { query, products: [], articles: [] };
}

export async function getSiteContext(): Promise<SiteContext> {
  const [global, icons, settings] = await Promise.all([getGlobal(), getIcons(), getSettings()]);
  if (!global) throw new Error('Publish the "Thông tin chung" (global) single type in Strapi.');
  return { global, icons, settings };
}
