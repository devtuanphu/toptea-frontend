import type { CSSProperties } from 'react';
import { iconUrl } from '@/lib/media';
import type { MediaFile } from '@/lib/types';

type Props = {
  file?: MediaFile | null;
  size?: number;
  className?: string;
  /** Accessible name; omit for decorative icons. */
  label?: string;
};

/**
 * Renders an icon uploaded in Strapi. The SVG is used as a CSS mask so it takes
 * the current text color, letting one icon work on light and dark backgrounds.
 */
export default function Icon({ file, size = 24, className = '', label }: Props) {
  const src = iconUrl(file);
  if (!src) return null;
  const style = { '--icon': `url("${src}")`, width: size, height: size } as CSSProperties;
  return label ? (
    <span role="img" aria-label={label} className={`icon ${className}`} style={style} />
  ) : (
    <span aria-hidden="true" className={`icon ${className}`} style={style} />
  );
}
