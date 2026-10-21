import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('about-page', '/ve-chung-toi');

export default function Page() {
  return <CmsPage type="about-page" />;
}
