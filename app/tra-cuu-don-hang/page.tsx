import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('order-tracking-page', '/tra-cuu-don-hang');

export default function Page() {
  return <CmsPage type="order-tracking-page" />;
}
