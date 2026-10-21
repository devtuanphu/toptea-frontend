import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Sections, { type SectionData } from '@/components/sections/SectionRenderer';
import { getGlobal, getPage, getSiteContext, type PageType } from './cms';
import { buildMetadata } from './seo';
import type { Picture } from './types';

/** Metadata for a page single type, falling back to the first section image for sharing. */
export async function pageMetadata(type: PageType, path: string): Promise<Metadata> {
  const [page, global] = await Promise.all([getPage(type), getGlobal()]);
  if (!page) return {};
  const firstImage = page.sections.find((s) => s.image || s.slides)?.image as Picture | undefined;
  return buildMetadata({
    seo: page.seo,
    title: page.title,
    path,
    image: firstImage?.media,
    global,
  });
}

/** Renders a page single type through its dynamic-zone sections. */
export async function CmsPage({ type, data }: { type: PageType; data?: Omit<SectionData, 'site'> }) {
  const [page, site] = await Promise.all([getPage(type), getSiteContext()]);
  if (!page) notFound();
  return <Sections sections={page.sections} data={{ site, ...data }} />;
}
