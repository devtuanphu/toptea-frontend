import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('thank-you-page', '/dat-hang-thanh-cong');

export default function Page() {
  return <CmsPage type="thank-you-page" />;
}
