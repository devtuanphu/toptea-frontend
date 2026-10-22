'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Props = { slides: ReactNode[]; seconds: number };

/**
 * Banner background slideshow: each image slowly zooms (alternately in and out) while it is up,
 * and the next one fades in over it. Stops on the current image for reduced-motion users.
 */
export default function BannerSlideshow({ slides, seconds }: Props) {
  const count = slides.length;
  const [{ active, leaving }, setState] = useState({ active: 0, leaving: -1 });

  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(
      () => setState((s) => ({ active: (s.active + 1) % count, leaving: s.active })),
      seconds * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [count, seconds, active]);

  return (
    <>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`slideshow__slide${i === active ? ' is-active' : i === leaving ? ' is-leaving' : ''}`}
        >
          {slide}
        </div>
      ))}
    </>
  );
}
