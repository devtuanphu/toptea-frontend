import Link from 'next/link';
import { getGlobal, getHeader, getIcons, getSettings } from '@/lib/cms';
import CmsImage from '@/components/ui/CmsImage';
import Icon from '@/components/ui/Icon';
import SmartLink from '@/components/ui/SmartLink';
import CartLink from './CartLink';
import MobileMenu from './MobileMenu';
import StickyHeader from './StickyHeader';
import type { Global } from '@/lib/types';

export function Brand({ global, variant = 'header' }: { global: Global; variant?: 'header' | 'drawer' | 'footer' }) {
  return (
    <span className={`brand brand--${variant}`}>
      <span className="brand__mark">
        <CmsImage picture={global.logo} alt="" sizes="48px" priority={variant === 'header'} />
      </span>
      <span className="brand__text">{global.logoText || global.siteName}</span>
    </span>
  );
}

export default async function Header() {
  const [header, global, icons, settings] = await Promise.all([getHeader(), getGlobal(), getIcons(), getSettings()]);
  if (!header || !global) return null;
  const allNav = [...(header.leftNav || []), ...(header.rightNav || [])];

  return (
    <StickyHeader>
      <div className="site-header__inner">
        <MobileMenu
          openLabel={header.menuLabel || ''}
          closeLabel={header.closeLabel || ''}
          menuIcon={<Icon file={icons.menu} size={24} />}
          closeIcon={<Icon file={icons.close} size={26} />}
          brand={<Brand global={global} variant="drawer" />}
          nav={allNav}
          chevron={<Icon file={icons.chevronRight} size={20} />}
          linesTitle={header.drawerLinksTitle}
          lines={header.drawerLinks || []}
          cta={header.drawerCta}
          contacts={[
            global.hotline ? { label: `Hotline: ${global.hotline}`, url: `tel:${global.hotline.replace(/\s/g, '')}` } : null,
            global.email ? { label: global.email, url: `mailto:${global.email}` } : null,
          ].filter(Boolean) as { label: string; url: string }[]}
          socials={(global.socials || []).map((s) => ({
            label: s.platform,
            url: s.url,
            icon: <Icon file={s.icon} size={22} />,
          }))}
        />

        <nav className="site-header__nav site-header__nav--left" aria-label={settings.mainNavLabel}>
          {(header.leftNav || []).map((item, i) => (
            <SmartLink key={item.id ?? i} href={item.url} className="site-header__link">
              {item.label}
            </SmartLink>
          ))}
        </nav>

        <Link href="/" className="site-header__brand" aria-label={global.siteName}>
          <Brand global={global} />
        </Link>

        <div className="site-header__right">
          <nav className="site-header__nav" aria-label={settings.secondaryNavLabel}>
            {(header.rightNav || []).map((item, i) => (
              <SmartLink key={item.id ?? i} href={item.url} className="site-header__link">
                {item.label}
              </SmartLink>
            ))}
          </nav>
          <Link href="/tim-kiem" className="site-header__icon" aria-label={header.searchLabel}>
            <Icon file={icons.search} size={22} />
          </Link>
          <CartLink label={header.cartLabel || ''} icon={<Icon file={icons.bag} size={22} />} />
        </div>
      </div>
    </StickyHeader>
  );
}
