'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 767px)';

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

/** True on phone-sized screens (same breakpoint as the CSS). False during server render. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
