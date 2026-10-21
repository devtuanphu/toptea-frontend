'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Props = { slides: ReactNode[]; labels: string[]; interval: number };

/** Cross-fading slider. Autoplays every `interval` seconds; pauses only while a keyboard user is inside it. */
export default function HeroSliderClient({ slides, labels, interval }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!interval || paused || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Restarts after a manual change, so every slide stays up for the full interval.
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % slides.length), interval * 1000);
    return () => window.clearTimeout(timer);
  }, [interval, paused, slides.length, active]);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      onFocus={(e) => setPaused(e.target.matches(':focus-visible'))}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`hero__item${i === active ? ' is-active' : ''}`}
          aria-roledescription="slide"
          aria-label={`${i + 1} / ${slides.length}`}
          aria-hidden={i !== active}
          inert={i !== active}
        >
          {slide}
        </div>
      ))}
      {slides.length > 1 && (
        <div className="hero__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero__dot${i === active ? ' is-active' : ''}`}
              aria-label={labels[i]}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
