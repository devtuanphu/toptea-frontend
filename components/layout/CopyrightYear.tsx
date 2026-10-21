import { cacheLife } from 'next/cache';

/** Current year for the footer, cached so the page can still be prerendered. */
export default async function CopyrightYear() {
  'use cache';
  cacheLife('days');
  return <>{new Date().getFullYear()}</>;
}
