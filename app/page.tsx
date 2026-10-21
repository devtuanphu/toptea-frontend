import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('home-page', '/');

export default function HomePage() {
  return <CmsPage type="home-page" />;
}
