import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Cormorant_Garamond } from 'next/font/google';
import { CartProvider } from '@/components/commerce/CartProvider';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getGlobal, getHeader } from '@/lib/cms';
import { SITE_URL, absoluteUrl, jsonLd, publicMediaUrl } from '@/lib/seo';
import './globals.css';

const serif = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '500', '600'],
  display: 'swap',
});

const sans = Be_Vietnam_Pro({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a1e3c',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal();
  const seo = global?.defaultSeo;
  const favicon = publicMediaUrl(global?.favicon);
  const share = publicMediaUrl(seo?.shareImage);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo?.metaTitle || global?.siteName || '', template: `%s | ${global?.siteName || ''}` },
    description: seo?.metaDescription,
    keywords: seo?.keywords,
    applicationName: global?.siteName,
    formatDetection: { telephone: false },
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    openGraph: {
      siteName: global?.siteName,
      locale: 'vi_VN',
      type: 'website',
      ...(share ? { images: [{ url: share }] } : {}),
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [global, header] = await Promise.all([getGlobal(), getHeader()]);
  const organization = global && {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: global.siteName,
        url: SITE_URL,
        logo: publicMediaUrl(global.logo?.media),
        email: global.email,
        telephone: global.hotline,
        address: global.address,
        sameAs: (global.socials || []).map((s) => s.url),
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: global.siteName,
        url: SITE_URL,
        inLanguage: 'vi-VN',
        publisher: { '@id': absoluteUrl('/#organization') },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl('/tim-kiem')}?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="vi" className={`${serif.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body>
        {header?.skipLinkLabel && (
          <a href="#main" className="skip-link">
            {header.skipLinkLabel}
          </a>
        )}
        <CartProvider>
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </CartProvider>
        {organization && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organization) }} />
        )}
      </body>
    </html>
  );
}
