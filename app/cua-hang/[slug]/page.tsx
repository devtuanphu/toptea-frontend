import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/commerce/AddToCart';
import ProductGallery from '@/components/commerce/ProductGallery';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import CmsImage from '@/components/ui/CmsImage';
import Icon from '@/components/ui/Icon';
import Rt, { mobileHidden } from '@/components/ui/Rt';
import { ProductCard, productHref } from '@/components/ui/cards';
import { getGlobal, getProduct, getProductPageConfig, getProducts, getSiteContext } from '@/lib/cms';
import { formatPrice } from '@/lib/format';
import { iconUrl } from '@/lib/media';
import { absoluteUrl, buildMetadata, jsonLd, publicMediaUrl } from '@/lib/seo';
import type { Product } from '@/lib/types';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/cua-hang/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const [product, global] = await Promise.all([getProduct(slug), getGlobal()]);
  if (!product) return {};
  return buildMetadata({
    seo: product.seo,
    title: product.name,
    description: product.shortDescription,
    path: productHref(product.slug),
    image: product.images?.[0]?.media,
    global,
  });
}

function related(product: Product, all: Product[], count: number) {
  const others = all.filter((p) => p.slug !== product.slug);
  const same = others.filter((p) => p.category?.slug === product.category?.slug);
  return [...same, ...others.filter((p) => !same.includes(p))].slice(0, count);
}

export default function ProductPage({ params }: PageProps<'/cua-hang/[slug]'>) {
  return (
    <>
      <div className="header-backdrop" aria-hidden="true" />
      {/* Known slugs are fully prerendered; the fallback only shows for new products until cached. */}
      <Suspense fallback={<div className="detail-skeleton" aria-busy="true" />}>
        <ProductDetail params={params} />
      </Suspense>
    </>
  );
}

async function ProductDetail({ params }: Pick<PageProps<'/cua-hang/[slug]'>, 'params'>) {
  const { slug } = await params;
  const [product, config, all, site] = await Promise.all([
    getProduct(slug),
    getProductPageConfig(),
    getProducts(),
    getSiteContext(),
  ]);
  if (!product || !config) notFound();
  const { icons, settings } = site;
  const images = (product.images || []).filter((img) => img?.media);
  const currency = settings.currencySuffix || '₫';
  const relatedProducts = related(product, all, config.relatedCount ?? 4);
  const category = product.category;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        description: product.shortDescription,
        image: images.map((img) => publicMediaUrl(img?.media)).filter(Boolean),
        category: category?.name,
        brand: { '@type': 'Brand', name: site.global.siteName },
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(productHref(product.slug)),
          priceCurrency: 'VND',
          price: product.price,
          availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: config.breadcrumbLabel, item: absoluteUrl(config.breadcrumbUrl || '/cua-hang') },
          ...(category
            ? [{ '@type': 'ListItem', position: 2, name: category.label || category.name, item: absoluteUrl(`/cua-hang?loai=${category.slug}`) }]
            : []),
          { '@type': 'ListItem', position: category ? 3 : 2, name: product.name, item: absoluteUrl(productHref(product.slug)) },
        ],
      },
    ],
  };

  return (
    <>
      <nav className="breadcrumb" aria-label={settings.breadcrumbLabel}>
        <ol>
          <li>
            <Link href={config.breadcrumbUrl || '/cua-hang'}>{config.breadcrumbLabel}</Link>
            <Icon file={icons.chevronRight} size={14} />
          </li>
          {category && (
            <li>
              <Link href={`/cua-hang?loai=${category.slug}`}>{category.label || category.name}</Link>
              <Icon file={icons.chevronRight} size={14} />
            </li>
          )}
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <section className="pdp">
        <ProductGallery
          main={images.map((img, i) => (
            <CmsImage
              key={i}
              picture={img}
              alt={img?.alt || product.name}
              sizes="(max-width: 767px) 100vw, 50vw"
              priority={i === 0}
            />
          ))}
          thumbs={images.map((img, i) => (
            <CmsImage key={i} picture={img} alt="" sizes="120px" />
          ))}
          labels={images.map((img, i) => img?.alt || `${product.name} ${i + 1}`)}
        />
        <div className="pdp__info">
          {category && <p className="eyebrow">{category.label || category.name}</p>}
          <h1 className="h1">{product.name}</h1>
          <p className="price">{formatPrice(product.price, currency)}</p>
          {product.shortDescription && (
            <p className="body-lg muted">
              <Rt d={product.shortDescription} m={product.mobileShortDescription} />
            </p>
          )}
          {product.keyMessage?.title && (
            <div className="key-message">
              <p className="h4">{product.keyMessage.title}</p>
              {!!product.keyMessage.items?.length && (
                <ul className="key-message__items">
                  {product.keyMessage.items.map((item, i) => (
                    <li key={item.id ?? i} className="label">
                      <Icon file={item.icon} size={20} />
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
              {product.keyMessage.note && <p className="label">{product.keyMessage.note}</p>}
            </div>
          )}
          {product.highlight?.label && (
            <p className="pdp__highlight body">
              <Icon file={product.highlight.icon} size={20} />
              <Rt d={product.highlight.label} m={product.highlight.mobileLabel} />
            </p>
          )}
          <AddToCart
            item={{
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: iconUrl(images[0]?.media),
              category: category?.label || category?.name,
            }}
            label={config.addToCartLabel}
            addedLabel={config.addedLabel}
            decreaseLabel={settings.decreaseLabel}
            increaseLabel={settings.increaseLabel}
            disabled={product.inStock === false}
            currency={settings.currencySuffix || '₫'}
            toast={{
              message: settings.cartAddedMessage,
              countTemplate: settings.cartToastCountTemplate,
              viewCartLabel: settings.cartToastViewCartLabel,
              checkoutLabel: settings.cartToastCheckoutLabel,
              closeLabel: settings.cartToastCloseLabel,
            }}
            icons={{
              minus: <Icon file={icons.minus} size={18} />,
              plus: <Icon file={icons.plus} size={18} />,
              check: <Icon file={icons.check} size={16} />,
              close: <Icon file={icons.close} size={18} />,
            }}
          />
          {!!product.specs?.length && (
            <dl className="specs">
              {product.specs.map((row, i) => (
                <div key={row.id ?? i} className={`specs__row${mobileHidden(row.hideOnMobile)}`}>
                  <dt className="label muted">
                    <Rt d={row.label} m={row.mobileLabel} />
                  </dt>
                  <dd className="body-sm">
                    <Rt d={row.value} m={row.mobileValue} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {(product.sections || []).map((section) => (
        <SectionRenderer key={`${section.__component}-${section.id}`} section={section} data={{ site }} />
      ))}

      {relatedProducts.length > 0 && (
        <section className="related">
          <h2 className="h2">{config.relatedTitle}</h2>
          <ul className="product-grid">
            {relatedProducts.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} settings={settings} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(config.sections || []).map((section) => (
        <SectionRenderer key={`${section.__component}-${section.id}`} section={section} data={{ site }} />
      ))}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </>
  );
}
