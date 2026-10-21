import { Suspense } from 'react';
import CartView, { type CartLabels } from '@/components/commerce/CartView';
import CheckoutView, { type CheckoutLabels } from '@/components/commerce/CheckoutView';
import OrderLookup, { type LookupLabels } from '@/components/commerce/OrderLookup';
import OrderSummaryBox from '@/components/commerce/OrderSummaryBox';
import CmsImage from '@/components/ui/CmsImage';
import Eyebrow from '@/components/ui/Eyebrow';
import Icon from '@/components/ui/Icon';
import Rt from '@/components/ui/Rt';
import { ButtonRow } from '@/components/ui/Button';
import { ArticleCard, ProductCard } from '@/components/ui/cards';
import { searchSite } from '@/lib/cms';
import { fill } from '@/lib/format';
import type { ButtonItem, Picture, Section, SiteContext } from '@/lib/types';
import SearchTabs from './SearchTabs';

export function Cart({ section, site }: { section: Section; site: SiteContext }) {
  const { icons, settings } = site;
  return (
    <section className="commerce-main">
      <CartView
        labels={{
          ...(section as unknown as CartLabels),
          removeLabel: settings.removeLabel,
          decreaseLabel: settings.decreaseLabel,
          increaseLabel: settings.increaseLabel,
        }}
        currency={settings.currencySuffix || '₫'}
        icons={{
          minus: <Icon file={icons.minus} size={16} />,
          plus: <Icon file={icons.plus} size={16} />,
          close: <Icon file={icons.close} size={20} />,
          back: <Icon file={icons.arrowRight} size={18} />,
        }}
      />
    </section>
  );
}

export function Checkout({ section, site }: { section: Section; site: SiteContext }) {
  return (
    <section className="commerce-main">
      <CheckoutView
        labels={{
          ...(section as unknown as CheckoutLabels),
          paymentMethods: section.paymentMethods || [],
          freeLabel: site.settings.freeLabel,
        }}
        currency={site.settings.currencySuffix || '₫'}
      />
    </section>
  );
}

export function OrderSuccess({ section, site }: { section: Section; site: SiteContext }) {
  return (
    <section className="order-success">
      <span className="order-success__icon" aria-hidden="true">
        <Icon file={section.icon} size={40} />
      </span>
      <Eyebrow>{section.eyebrow}</Eyebrow>
      <h1 className="h1">{section.title}</h1>
      {section.description && (
        <p className="body-lg muted order-success__desc">
          <Rt d={section.description} m={section.mobileDescription} />
        </p>
      )}
      <OrderSummaryBox
        labels={{
          orderCodeLabel: section.orderCodeLabel,
          mobileOrderCodeLabel: section.mobileOrderCodeLabel,
          totalLabel: section.totalLabel,
          paymentLabel: section.paymentLabel,
          emailLabel: section.emailLabel,
        }}
        currency={site.settings.currencySuffix || '₫'}
        bank={{
          methodCode: site.settings.bankTransferMethodCode,
          title: site.settings.bankTransferTitle,
          note: site.settings.bankTransferNote,
          // The shop's own payment QR, uploaded in Cài đặt cửa hàng.
          qr: site.settings.bankQr ? (
            <CmsImage file={site.settings.bankQr} alt={site.settings.bankTransferTitle || 'QR'} sizes="240px" />
          ) : undefined,
        }}
      />
      <ButtonRow buttons={section.buttons as ButtonItem[]} />
    </section>
  );
}

export function OrderLookupSection({ section, site }: { section: Section; site: SiteContext }) {
  return (
    <section className="commerce-main commerce-main--lookup">
      <OrderLookup labels={section as unknown as LookupLabels} currency={site.settings.currencySuffix || '₫'} />
    </section>
  );
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Search banner + results. The query comes from ?q=, resolved inside Suspense. */
export function SearchResults({
  section,
  site,
  searchParams,
}: {
  section: Section;
  site: SiteContext;
  searchParams?: SearchParams;
}) {
  const banner = (query: string) => (
    <section className="page-banner page-banner--search">
      <div className="page-banner__bg" aria-hidden="true">
        <CmsImage picture={section.image as Picture} alt="" sizes="100vw" priority />
      </div>
      <div className="page-banner__content">
        <Eyebrow className="eyebrow--light">{section.eyebrow}</Eyebrow>
        <h1 className="h1">
          {query ? (
            <Rt
              d={fill(section.titleTemplate, { query })}
              m={section.mobileTitleTemplate ? fill(section.mobileTitleTemplate, { query }) : undefined}
            />
          ) : (
            section.emptyTitle
          )}
        </h1>
        <form className="searchbar" action="/tim-kiem" role="search">
          <Icon file={site.icons.search} size={22} />
          <label htmlFor="search-q" className="visually-hidden">
            {section.placeholder}
          </label>
          <input id="search-q" name="q" type="search" defaultValue={query} placeholder={section.placeholder} maxLength={80} />
          {query && (
            <a href="/tim-kiem" className="searchbar__clear" aria-label={site.settings.clearLabel}>
              <Icon file={site.icons.close} size={18} />
            </a>
          )}
        </form>
      </div>
    </section>
  );
  return (
    <Suspense fallback={banner('')}>
      <SearchBody section={section} site={site} searchParams={searchParams} banner={banner} />
    </Suspense>
  );
}

async function SearchBody({
  section,
  site,
  searchParams,
  banner,
}: {
  section: Section;
  site: SiteContext;
  searchParams?: SearchParams;
  banner: (query: string) => React.ReactNode;
}) {
  const params = (await searchParams) || {};
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw || '').trim().slice(0, 80);
  const results = query.length >= 2 ? await searchSite(query) : { products: [], articles: [] };
  const total = results.products.length + results.articles.length;

  return (
    <>
      {banner(query)}
      {query && (
        <div className="search-results">
          <SearchTabs
            labels={{ all: section.allLabel, products: section.productsLabel, articles: section.articlesLabel }}
            count={fill(section.countTemplate, { count: total })}
            productsHeading={fill(section.productsHeading, { count: results.products.length })}
            articlesHeading={fill(section.articlesHeading, { count: results.articles.length })}
            products={results.products.map((p) => (
              <ProductCard key={p.slug} product={p} settings={site.settings} />
            ))}
            articles={results.articles.map((a) => (
              <ArticleCard key={a.slug} article={a} readMoreLabel={section.readMoreLabel} arrow={site.icons.arrowRight} />
            ))}
            empty={total === 0 ? section.noResultsText : ''}
          />
        </div>
      )}
    </>
  );
}
