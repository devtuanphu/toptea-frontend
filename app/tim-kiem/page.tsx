import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('search-page', '/tim-kiem');

// The query is read inside the search section's Suspense boundary.
export default function SearchPage({ searchParams }: PageProps<'/tim-kiem'>) {
  return <CmsPage type="search-page" data={{ searchParams }} />;
}
