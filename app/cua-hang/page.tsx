import { productHref } from '@/components/ui/cards';
import { getProducts } from '@/lib/cms';
import { CmsPage, pageMetadata } from '@/lib/pages';
import { absoluteUrl, jsonLd } from '@/lib/seo';

export const generateMetadata = () => pageMetadata('shop-page', '/cua-hang');

export default async function ShopPage() {
  const products = await getProducts();
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(productHref(p.slug)),
      name: p.name,
    })),
  };
  return (
    <>
      <CmsPage type="shop-page" data={{ products }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
    </>
  );
}
