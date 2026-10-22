import type { Article, Product, Section, SiteContext, Taxonomy } from '@/lib/types';
import {
  BrewGuides,
  CardGrid,
  CtaBand,
  Faq,
  ImageBand,
  NotFoundSection,
  PageBanner,
  Philosophy,
  Process,
  QuoteBand,
  SplitStory,
  UsageSteps,
} from './content';
import { Cart, Checkout, OrderLookupSection, OrderSuccess, SearchResults } from './commerce';
import { ContactPanel, Newsletter } from './engagement';
import FeaturedProducts from './FeaturedProducts';
import HeroSlider from './HeroSlider';
import ShopBanner from './ShopBanner';
import { ArticleListing, ProductGrid } from './listings';

export type SectionData = {
  site: SiteContext;
  products?: Product[];
  articles?: Article[];
  articleCategories?: Taxonomy[];
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Maps a Strapi dynamic-zone component to its React section. */
export function SectionRenderer({ section, data }: { section: Section; data: SectionData }) {
  const { site } = data;
  switch (section.__component) {
    case 'sections.page-banner':
      return <PageBanner section={section} />;
    case 'sections.split-story':
      return <SplitStory section={section} site={site} />;
    case 'sections.image-band':
      return <ImageBand section={section} />;
    case 'sections.quote-band':
      return <QuoteBand section={section} />;
    case 'sections.cta-band':
      return <CtaBand section={section} />;
    case 'sections.newsletter':
      return <Newsletter section={section} />;
    case 'sections.card-grid':
      return <CardGrid section={section} />;
    case 'sections.faq':
      return <Faq section={section} site={site} />;
    case 'home.hero-slider':
      return <HeroSlider section={section} />;
    case 'home.philosophy':
      return <Philosophy section={section} />;
    case 'home.process':
      return <Process section={section} />;
    case 'home.featured-products':
      return <FeaturedProducts section={section} site={site} />;
    case 'shop.banner-slider':
      return <ShopBanner section={section} />;
    case 'shop.product-grid':
      return <ProductGrid section={section} site={site} products={data.products || []} />;
    case 'product.brew-guides':
      return <BrewGuides section={section} />;
    case 'product.usage-steps':
      return <UsageSteps section={section} />;
    case 'blog.article-listing':
      return (
        <ArticleListing
          section={section}
          site={site}
          articles={data.articles || []}
          categories={data.articleCategories || []}
        />
      );
    case 'contact.contact-panel':
      return <ContactPanel section={section} site={site} />;
    case 'commerce.cart':
      return <Cart section={section} site={site} />;
    case 'commerce.checkout':
      return <Checkout section={section} site={site} />;
    case 'commerce.order-success':
      return <OrderSuccess section={section} site={site} />;
    case 'commerce.order-lookup':
      return <OrderLookupSection section={section} site={site} />;
    case 'commerce.search-results':
      return <SearchResults section={section} site={site} searchParams={data.searchParams} />;
    case 'system.not-found':
      return <NotFoundSection section={section} />;
    default:
      return null;
  }
}

// The shop banner puts the header in the page flow below it, so it needs no backdrop either.
const HERO_COMPONENTS = new Set([
  'sections.page-banner',
  'home.hero-slider',
  'commerce.search-results',
  'shop.banner-slider',
]);

/** Renders a page's sections. Pages that don't open with a hero get a solid bar behind the header. */
export default function Sections({ sections, data }: { sections: Section[]; data: SectionData }) {
  const opensWithHero = HERO_COMPONENTS.has(sections[0]?.__component);
  return (
    <>
      {!opensWithHero && <div className="header-backdrop" aria-hidden="true" />}
      {sections.map((section) => (
        <SectionRenderer key={`${section.__component}-${section.id}`} section={section} data={data} />
      ))}
    </>
  );
}
