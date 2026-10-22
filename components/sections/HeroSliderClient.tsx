'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  slides: ReactNode[];
  labels: string[];
  interval: number;
  prevLabel: string;
  nextLabel: string;
};

/**
 * Cross-fading slider: the left/right half of the banner steps back/forward (arrow cursor on hover,
 * swipe on touch). The incoming slide fades in over the outgoing one, which stays put underneath.
 * Autoplays every `interval` seconds; pauses only while a keyboard user is inside it.
 */
export default function HeroSliderClient({ slides, labels, interval, prevLabel, nextLabel }: Props) {
  const count = slides.length;
  const [{ active, leaving }, setState] = useState({ active: 0, leaving: -1 });
  const [paused, setPaused] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const go = (to: number) =>
    setState((s) => {
      const next = (to + count) % count;
      return next === s.active ? s : { active: next, leaving: s.active };
    });

  useEffect(() => {
    if (!interval || paused || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Restarts after a manual change, so every slide stays up for the full interval.
    const timer = window.setTimeout(
      () => setState((s) => ({ active: (s.active + 1) % count, leaving: s.active })),
      interval * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [interval, paused, count, active]);

  const step = (delta: number) => {
    // A swipe already changed the slide; ignore the click the browser may send after it.
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    go(active + delta);
  };

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      onFocus={(e) => setPaused(e.target.matches(':focus-visible'))}
      onBlur={() => setPaused(false)}
      onPointerDown={(e) => {
        swiped.current = false;
        swipe.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start || count < 2) return;
        const dx = e.clientX - start.x;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(e.clientY - start.y)) return;
        swiped.current = true;
        go(active + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`hero__item${i === active ? ' is-active' : i === leaving ? ' is-leaving' : ''}`}
          aria-roledescription="slide"
          aria-label={`${i + 1} / ${count}`}
          aria-hidden={i !== active}
          inert={i !== active}
        >
          {slide}
        </div>
      ))}
      {count > 1 && (
        <>
          <button type="button" className="hero__nav hero__nav--prev" aria-label={prevLabel} onClick={() => step(-1)} />
          <button type="button" className="hero__nav hero__nav--next" aria-label={nextLabel} onClick={() => step(1)} />
          <div className="hero__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero__dot${i === active ? ' is-active' : ''}`}
                aria-label={labels[i]}
                aria-current={i === active}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
