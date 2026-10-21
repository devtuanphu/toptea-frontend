'use client';

import { useState, type ReactNode } from 'react';

/** Main image + thumbnails; images are rendered on the server and passed in. */
export default function ProductGallery({
  main,
  thumbs,
  labels,
}: {
  main: ReactNode[];
  thumbs: ReactNode[];
  labels: string[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="gallery">
      <div className="gallery__main">
        {main.map((node, i) => (
          <div key={i} className={`gallery__slide${i === active ? ' is-active' : ''}`} aria-hidden={i !== active}>
            {node}
          </div>
        ))}
      </div>
      {thumbs.length > 1 && (
        <div className="gallery__thumbs">
          {thumbs.map((node, i) => (
            <button
              key={i}
              type="button"
              className={`gallery__thumb${i === active ? ' is-active' : ''}`}
              aria-label={labels[i]}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              {node}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
