import Link from 'next/link';
import CmsImage from '@/components/ui/CmsImage';
import Icon from '@/components/ui/Icon';
import SmartLink from '@/components/ui/SmartLink';
import Rt from '@/components/ui/Rt';
import { productHref } from '@/components/ui/cards';
import type { Product, Section, SiteContext } from '@/lib/types';
import { SectionHead } from './content';

/** Home "Sản phẩm nổi bật": editorial cards for the products picked in the CMS. */
export default function FeaturedProducts({ section, site }: { section: Section; site: SiteContext }) {
  const products = (section.products || []) as Product[];
  return (
    <section className="featured">
      <SectionHead
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        mobileDescription={section.mobileDescription}
      />
      <ul className="featured__grid">
        {products.map((product) => (
          <li key={product.documentId}>
            <Link href={productHref(product.slug)} className="tea-card">
              <div className="tea-card__media">
                <CmsImage
                  picture={product.images?.[0]}
                  alt={product.images?.[0]?.alt || product.name}
                  sizes="(max-width: 767px) 100vw, 33vw"
                />
                {product.badge && (
                  <span className="tea-card__badge" lang="zh">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="tea-card__meta">
                <span className="eyebrow">{product.subtitle || product.category?.label}</span>
                {product.sizeLabel && <span className="caption">{product.sizeLabel}</span>}
              </p>
              <h3 className="h3">{product.name}</h3>
              {product.shortDescription && (
                <p className="body-sm muted">
                  <Rt d={product.shortDescription} m={product.mobileShortDescription} />
                </p>
              )}
              <span className="tea-card__rule" aria-hidden="true" />
              <span className="tea-card__foot">
                <span className="caption muted">
                  <Rt d={product.cardNote} m={product.mobileCardNote} />
                </span>
                {section.cardLinkLabel && (
                  <span className="text-link">
                    {section.cardLinkLabel}
                    <Icon file={site.icons.arrowRight} size={16} />
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {section.seeAllLabel && (
        <SmartLink href={section.seeAllUrl || '/cua-hang'} className="text-link featured__all">
          <Rt d={section.seeAllLabel} m={section.mobileSeeAllLabel} />
          <Icon file={site.icons.arrowRight} size={18} />
        </SmartLink>
      )}
    </section>
  );
}
