import CmsImage from '@/components/ui/CmsImage';
import type { Picture, Section } from '@/lib/types';
import BannerSlideshow from './BannerSlideshow';
import ShopBannerFlag from './ShopBannerFlag';

/**
 * Shop page top: image-only slideshow pinned behind the page. The site header sits right below it
 * and the page scrolls up over it (layout rules in sections.css, "Shop banner", keyed to <html data-shop-banner>).
 */
export default function ShopBanner({ section }: { section: Section }) {
  const pictures = ((section.images as Picture[]) || []).filter((p) => p?.media);
  const slides = pictures.map((picture, i) => (
    <CmsImage key={i} picture={picture} alt="" sizes="100vw" priority={i === 0} />
  ));
  return (
    <section className="shop-banner">
      <ShopBannerFlag />
      <h1 className="visually-hidden">{section.title}</h1>
      <div className="shop-banner__media" aria-hidden="true">
        <BannerSlideshow slides={slides} seconds={Number(section.slideSeconds) || 3.5} />
      </div>
    </section>
  );
}
