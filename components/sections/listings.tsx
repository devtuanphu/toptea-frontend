import { Suspense } from 'react';
import Link from 'next/link';
import CmsImage from '@/components/ui/CmsImage';
import Icon from '@/components/ui/Icon';
import { ArticleCard, ProductCard, articleHref } from '@/components/ui/cards';
import type { Article, Product, Section, SiteContext, Taxonomy } from '@/lib/types';
import FilterableGrid, { StaticGrid, type FilterItem, type FilterOption } from './FilterableGrid';
import Rt from '@/components/ui/Rt';

/** Shop grid with CMS-defined filter chips (category or brew method). */
export function ProductGrid({ section, site, products }: { section: Section; site: SiteContext; products: Product[] }) {
  const filters: FilterOption[] = ((section.filters || []) as { label: string; kind: string; slug?: string }[]).map(
    (f) => ({ label: f.label, value: f.kind === 'all' ? '' : f.slug || '' }),
  );
  const items: FilterItem[] = products.map((product, i) => ({
    key: product.slug,
    tags: [product.category?.slug || '', ...(product.brewMethods || []).map((b) => b.slug)].filter(Boolean),
    // The first row is above the fold, so it is loaded eagerly for LCP.
    node: <ProductCard product={product} settings={site.settings} headingLevel="h2" priority={i < 4} />,
  }));
  return (
    <section className="shop-grid">
      <Suspense fallback={<StaticGrid filters={filters} items={items} className="product-grid" />}>
        <FilterableGrid
          filters={filters}
          items={items}
          param="loai"
          className="product-grid"
          emptyText={section.emptyText}
          ariaLabel={site.settings.filterProductsLabel || ''}
        />
      </Suspense>
    </section>
  );
}

/** Blog listing: category chips, featured article, then the article grid. */
export function ArticleListing({
  section,
  site,
  articles,
  categories,
}: {
  section: Section;
  site: SiteContext;
  articles: Article[];
  categories: Taxonomy[];
}) {
  const featured = articles.find((a) => a.featured) || articles[0];
  const usedCategories = categories.filter((c) => articles.some((a) => a.category?.slug === c.slug));
  const filters: FilterOption[] = [
    { label: section.allLabel || '', value: '' },
    ...usedCategories.map((c) => ({ label: c.label || c.name, value: c.slug })),
  ];
  // The featured article is shown large in the "all" view and as a card when filtering.
  const toItem = (article: Article): FilterItem => ({
    key: article.slug,
    tags: [article.category?.slug || ''],
    node: <ArticleCard article={article} readMoreLabel={section.readMoreLabel} arrow={site.icons.arrowRight} headingLevel="h2" />,
  });
  const lead = featured ? (
    <Link href={articleHref(featured.slug)} className="featured-post">
      <div className="featured-post__media">
        <CmsImage picture={featured.cover} alt={featured.cover?.alt || featured.title} sizes="(max-width: 767px) 100vw, 55vw" priority />
      </div>
      <div className="featured-post__text">
        <p className="eyebrow">
          {featured.category?.label}
          {section.featuredSuffix && (
            <span className="hide-mobile">
              {featured.category?.label ? ' · ' : ''}
              {section.featuredSuffix}
            </span>
          )}
        </p>
        <h2 className="h2">{featured.title}</h2>
        {featured.excerpt && (
          <p className="body-lg muted">
            <Rt d={featured.excerpt} m={featured.mobileExcerpt} />
          </p>
        )}
        {section.featuredLinkLabel && (
          <span className="text-link">
            {section.featuredLinkLabel}
            <Icon file={site.icons.arrowRight} size={18} />
          </span>
        )}
      </div>
    </Link>
  ) : null;
  const items = articles.map(toItem);
  const hideInAll = featured ? [featured.slug] : [];
  return (
    <section className="blog-listing">
      <Suspense
        fallback={<StaticGrid filters={filters} items={items} className="article-grid" lead={lead} hideInAll={hideInAll} />}
      >
        <FilterableGrid
          filters={filters}
          items={items}
          param="chuyen-muc"
          className="article-grid"
          lead={lead}
          hideInAll={hideInAll}
          emptyText={section.emptyText}
          ariaLabel={site.settings.filterArticlesLabel || ''}
        />
      </Suspense>
    </section>
  );
}
