'use client';

import { useState, type ReactNode } from 'react';

type Tab = 'all' | 'products' | 'articles';

export default function SearchTabs({
  labels,
  count,
  productsHeading,
  articlesHeading,
  products,
  articles,
  empty,
}: {
  labels: { all?: string; products?: string; articles?: string };
  count: string;
  productsHeading: string;
  articlesHeading: string;
  products: ReactNode[];
  articles: ReactNode[];
  empty?: string;
}) {
  const [tab, setTab] = useState<Tab>('all');
  const tabs: [Tab, string | undefined][] = [
    ['all', labels.all],
    ['products', labels.products],
    ['articles', labels.articles],
  ];
  return (
    <>
      <div className="search-results__top">
        <div className="chips" role="toolbar">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`chip${tab === key ? ' is-active' : ''}`}
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="label muted" role="status">
          {count}
        </p>
      </div>
      {empty && <p className="body muted empty-note">{empty}</p>}
      {tab !== 'articles' && products.length > 0 && (
        <>
          <h2 className="h3">{productsHeading}</h2>
          <ul className="product-grid">
            {products.map((node, i) => (
              <li key={i}>{node}</li>
            ))}
          </ul>
        </>
      )}
      {tab !== 'products' && articles.length > 0 && (
        <>
          <h2 className="h3">{articlesHeading}</h2>
          <ul className="article-grid article-grid--search">
            {articles.map((node, i) => (
              <li key={i}>{node}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
