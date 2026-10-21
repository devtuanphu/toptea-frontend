import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('cart-page', '/gio-hang');

export default function Page() {
  return <CmsPage type="cart-page" />;
}
