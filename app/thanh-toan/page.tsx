import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('checkout-page', '/thanh-toan');

export default function Page() {
  return <CmsPage type="checkout-page" />;
}
