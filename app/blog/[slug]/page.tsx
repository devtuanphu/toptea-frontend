import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import CmsImage from '@/components/ui/CmsImage';
import RichText from '@/components/ui/RichText';
import { ArticleCard, articleHref } from '@/components/ui/cards';
import { getArticle, getArticlePageConfig, getArticles, getGlobal, getPage, getSiteContext } from '@/lib/cms';
import { formatDate } from '@/lib/format';
import { absoluteUrl, buildMetadata, jsonLd, publicMediaUrl } from '@/lib/seo';
import type { Article } from '@/lib/types';

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const [article, global] = await Promise.all([getArticle(slug), getGlobal()]);
  if (!article) return {};
  return buildMetadata({
    seo: article.seo,
    title: article.title,
    description: article.excerpt,
    path: articleHref(article.slug),
    image: article.cover?.media,
    global,
    type: 'article',
    publishedTime: article.publishedDate,
    modifiedTime: article.updatedAt,
  });
}

function related(article: Article, all: Article[], count: number) {
  const others = all.filter((a) => a.slug !== article.slug);
  const same = others.filter((a) => a.category?.slug === article.category?.slug);
  return [...same, ...others.filter((a) => !same.includes(a))].slice(0, count);
}

export default function ArticlePage({ params }: PageProps<'/blog/[slug]'>) {
  return (
    <>
      <div className="header-backdrop" aria-hidden="true" />
      <Suspense fallback={<div className="detail-skeleton" aria-busy="true" />}>
        <ArticleDetail params={params} />
      </Suspense>
    </>
  );
}

async function ArticleDetail({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  const { slug } = await params;
  const [article, config, all, site, blogPage] = await Promise.all([
    getArticle(slug),
    getArticlePageConfig(),
    getArticles(),
    getSiteContext(),
    getPage('blog-page'),
  ]);
  if (!article) notFound();
  const relatedArticles = related(article, all, config?.relatedCount ?? 3);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        image: publicMediaUrl(article.cover?.media),
        datePublished: article.publishedDate,
        dateModified: article.updatedAt,
        author: { '@type': 'Organization', name: article.author || site.global.siteName },
        publisher: { '@id': absoluteUrl('/#organization') },
        mainEntityOfPage: absoluteUrl(articleHref(article.slug)),
        articleSection: article.category?.name,
        keywords: (article.tags || []).map((t) => t.label).join(', '),
        inLanguage: 'vi-VN',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: blogPage?.title, item: absoluteUrl('/blog') },
          { '@type': 'ListItem', position: 2, name: article.title, item: absoluteUrl(articleHref(article.slug)) },
        ],
      },
    ],
  };

  return (
    <>
      <article className="article">
        <header className="article__head">
          {article.category && <p className="eyebrow">{article.category.label || article.category.name}</p>}
          <h1 className="h1">{article.title}</h1>
          <p className="article__meta">
            {article.author && <span className="label">{article.author}</span>}
            {article.publishedDate && (
              <>
                <span className="article__dot" aria-hidden="true">
                  {site.settings.productCardTagSeparator}
                </span>
                <time dateTime={article.publishedDate} className="caption muted">
                  {formatDate(article.publishedDate)}
                </time>
              </>
            )}
            {article.readingTime && (
              <>
                <span className="article__dot" aria-hidden="true">
                  {site.settings.productCardTagSeparator}
                </span>
                <span className="caption muted">{article.readingTime}</span>
              </>
            )}
          </p>
        </header>
        {article.cover?.media && (
          <div className="article__cover">
            <CmsImage picture={article.cover} alt={article.cover.alt || article.title} sizes="(max-width: 767px) 100vw, 1280px" priority />
          </div>
        )}
        <div className="article__body">
          <RichText blocks={article.content} />
          {!!article.tags?.length && (
            <ul className="tags">
              {article.tags.map((tag, i) => (
                <li key={tag.id ?? i}>{tag.label}</li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="related related--light">
          <h2 className="h2">{config?.relatedTitle}</h2>
          <ul className="article-grid">
            {relatedArticles.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} readMoreLabel={config?.readMoreLabel} arrow={site.icons.arrowRight} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(config?.sections || []).map((section) => (
        <SectionRenderer key={`${section.__component}-${section.id}`} section={section} data={{ site }} />
      ))}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </>
  );
}
