import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('contact-page', '/lien-he');

export default function Page() {
  return <CmsPage type="contact-page" />;
}
