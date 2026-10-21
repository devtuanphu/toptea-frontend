import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/gio-hang', '/thanh-toan', '/dat-hang-thanh-cong', '/tim-kiem'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
