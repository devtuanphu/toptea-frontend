import type { ReactNode } from 'react';

/**
 * Responsive text: shows `m` on phones and `d` elsewhere. Without a mobile
 * variant (empty in the CMS) only the desktop text is rendered.
 */
export default function Rt({ d, m }: { d?: ReactNode; m?: string | null }) {
  if (!m || m === d) return <>{d}</>;
  return (
    <>
      <span className="rt-d">{d}</span>
      <span className="rt-m">{m}</span>
    </>
  );
}

/** Class that hides an element on phones when the CMS item is marked "hide on mobile". */
export const mobileHidden = (hide?: boolean | null) => (hide ? ' hide-mobile' : '');
