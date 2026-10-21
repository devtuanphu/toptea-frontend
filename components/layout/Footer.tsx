import Link from 'next/link';
import { getFooter, getGlobal } from '@/lib/cms';
import Icon from '@/components/ui/Icon';
import SmartLink from '@/components/ui/SmartLink';
import Rt, { mobileHidden } from '@/components/ui/Rt';
import { Brand } from './Header';
import CopyrightYear from './CopyrightYear';

export default async function Footer() {
  const [footer, global] = await Promise.all([getFooter(), getGlobal()]);
  if (!footer || !global) return null;
  const [before, after] = (footer.copyright || '').split('{year}');

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Link href="/" aria-label={global.siteName}>
            <Brand global={global} variant="footer" />
          </Link>
          {global.tagline && <p className="eyebrow site-footer__tagline">{global.tagline}</p>}
          {footer.description && <p className="site-footer__desc">{footer.description}</p>}
        </div>
        <div className="site-footer__cols">
          {(footer.columns || []).map((col, i) => (
            <nav key={col.id ?? i} className="site-footer__col" aria-label={col.title}>
              {col.title && <p className="eyebrow">{col.title}</p>}
              <ul>
                {(col.links || []).map((link, j) => (
                  <li key={link.id ?? j} className={mobileHidden(link.hideOnMobile).trim() || undefined}>
                    <SmartLink href={link.url} newTab={link.openInNewTab}>
                      <Rt d={link.label} m={link.mobileLabel} />
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="site-footer__bottom">
        <p className="site-footer__copy">
          {before}
          {after !== undefined && <CopyrightYear />}
          {after}
        </p>
        <div className="social">
          {(global.socials || []).map((s, i) => (
            <a key={s.id ?? i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
              <Icon file={s.icon} size={22} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
