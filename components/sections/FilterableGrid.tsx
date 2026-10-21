'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';

export type FilterOption = { label: string; value: string };
export type FilterItem = { key: string; tags: string[]; node: ReactNode };

type Props = {
  filters: FilterOption[];
  items: FilterItem[];
  /** Query parameter that stores the active filter, so links like ?loai=combo work. */
  param: string;
  emptyText?: string;
  className: string;
  /** Rendered above the grid for the unfiltered view only (e.g. the featured article). */
  lead?: ReactNode;
  /** Item keys left out of the unfiltered view (shown in `lead` instead). */
  hideInAll?: string[];
  ariaLabel: string;
};

export default function FilterableGrid({ filters, items, param, emptyText, className, lead, hideInAll = [], ariaLabel }: Props) {
  const searchParams = useSearchParams();
  const initial = searchParams.get(param) || '';
  // Accept any known tag from the URL (e.g. footer links to a category without its own chip).
  const known = filters.some((f) => f.value === initial) || items.some((item) => item.tags.includes(initial));
  const [active, setActive] = useState(known ? initial : '');

  const select = (value: string) => {
    setActive(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(param, value);
    else url.searchParams.delete(param);
    window.history.replaceState(null, '', url);
  };

  const visible = active
    ? items.filter((item) => item.tags.includes(active))
    : items.filter((item) => !hideInAll.includes(item.key));

  return (
    <>
      {filters.length > 1 && (
        <div className="chips" role="toolbar" aria-label={ariaLabel}>
          {filters.map((f) => (
            <button
              key={f.value || 'all'}
              type="button"
              className={`chip${active === f.value ? ' is-active' : ''}`}
              aria-pressed={active === f.value}
              onClick={() => select(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      {!active && lead}
      {visible.length ? (
        <ul className={className}>
          {visible.map((item) => (
            <li key={item.key}>{item.node}</li>
          ))}
        </ul>
      ) : (
        <p className="body muted empty-note">{emptyText}</p>
      )}
    </>
  );
}

/** Server-rendered fallback used while search params are resolved: the full, unfiltered list. */
export function StaticGrid({
  filters,
  items,
  className,
  lead,
  hideInAll = [],
}: Pick<Props, 'filters' | 'items' | 'className' | 'lead' | 'hideInAll'>) {
  return (
    <>
      {filters.length > 1 && (
        <div className="chips">
          {filters.map((f) => (
            <span key={f.value || 'all'} className={`chip${f.value === '' ? ' is-active' : ''}`}>
              {f.label}
            </span>
          ))}
        </div>
      )}
      {lead}
      <ul className={className}>
        {items.filter((item) => !hideInAll.includes(item.key)).map((item) => (
          <li key={item.key}>{item.node}</li>
        ))}
      </ul>
    </>
  );
}
