import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { Article, MediaFile, Product, SiteSettings } from '@/lib/types';
import CmsImage from './CmsImage';
import Icon from './Icon';

import { articleHref, productHref } from '@/lib/routes';
import Rt from './Rt';

export { articleHref, productHref };

type HeadingLevel = 'h2' | 'h3';

/** Shop card: image, category, name, brew tags, price. */
export function ProductCard({
  product,
  settings,
  headingLevel: Heading = 'h3',
  sizes = '(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 300px',
  priority,
}: {
  product: Product;
  settings: SiteSettings;
  headingLevel?: HeadingLevel;
  sizes?: string;
  priority?: boolean;
}) {
  const tags = (product.brewMethods || []).slice(0, 2);
  return (
    <article className="product-card">
      <Link href={productHref(product.slug)} className="product-card__link">
        <div className="product-card__media">
          <CmsImage
            picture={product.images?.[0]}
            alt={product.images?.[0]?.alt || product.name}
            sizes={sizes}
            priority={priority}
          />
        </div>
        <div className="product-card__body">
          {product.category && <p className="eyebrow product-card__category">{product.category.label || product.category.name}</p>}
          <Heading className="product-card__name">{product.name}</Heading>
          {tags.length > 0 && (
            <p className="product-card__tags">
              {tags.map((tag, i) => (
                <span key={tag.slug}>
                  {i > 0 && (
                    <span className="product-card__dot" aria-hidden="true">
                      {settings.productCardTagSeparator}
                    </span>
                  )}
                  {tag.label || tag.name}
                </span>
              ))}
            </p>
          )}
          <p className="product-card__price">{formatPrice(product.price, settings.currencySuffix)}</p>
        </div>
      </Link>
    </article>
  );
}

/** Blog card: image, category, title, excerpt, read-more link. */
export function ArticleCard({
  article,
  readMoreLabel,
  arrow,
  headingLevel: Heading = 'h3',
  sizes = '(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 410px',
}: {
  article: Article;
  readMoreLabel?: string;
  arrow?: MediaFile | null;
  headingLevel?: HeadingLevel;
  sizes?: string;
}) {
  return (
    <article className="article-card">
      <Link href={articleHref(article.slug)} className="article-card__link">
        <div className="article-card__media">
          <CmsImage picture={article.cover} alt={article.cover?.alt || article.title} sizes={sizes} />
        </div>
        <div className="article-card__body">
          {article.category && <p className="eyebrow">{article.category.label || article.category.name}</p>}
          <Heading className="article-card__title">{article.title}</Heading>
          {article.excerpt && (
            <p className="article-card__excerpt">
              <Rt d={article.excerpt} m={article.mobileExcerpt} />
            </p>
          )}
          {readMoreLabel && (
            <span className="text-link">
              {readMoreLabel}
              <Icon file={arrow} size={18} />
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
