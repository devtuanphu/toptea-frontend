import { getArticleCategories, getArticles } from '@/lib/cms';
import { CmsPage, pageMetadata } from '@/lib/pages';

export const generateMetadata = () => pageMetadata('blog-page', '/blog');

export default async function BlogPage() {
  const [articles, articleCategories] = await Promise.all([getArticles(), getArticleCategories()]);
  return <CmsPage type="blog-page" data={{ articles, articleCategories }} />;
}
