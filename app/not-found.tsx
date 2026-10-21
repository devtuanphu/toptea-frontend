import type { Metadata } from 'next';
import Sections from '@/components/sections/SectionRenderer';
import { getPage, getSiteContext } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('not-found-page');
  return {
    title: { absolute: page?.seo?.metaTitle || page?.title || '' },
    description: page?.seo?.metaDescription,
    robots: { index: false, follow: true },
  };
}

export default async function NotFound() {
  const [page, site] = await Promise.all([getPage('not-found-page'), getSiteContext()]);
  if (!page) return <h1 className="h1">404</h1>;
  return <Sections sections={page.sections} data={{ site }} />;
}
