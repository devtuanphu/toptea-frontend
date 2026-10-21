import Image from 'next/image';
import { mediaUrl, pictureAlt } from '@/lib/media';
import type { MediaFile, Picture } from '@/lib/types';

type Props = {
  picture?: Picture;
  file?: MediaFile | null;
  alt?: string;
  sizes: string;
  className?: string;
  /** Above-the-fold image (LCP): load eagerly with high priority. */
  priority?: boolean;
};

/** Fills its (positioned) parent with an optimized image from the Media Library. */
export default function CmsImage({ picture, file, alt, sizes, className, priority }: Props) {
  const media = file || picture?.media;
  const src = mediaUrl(media);
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt ?? (picture ? pictureAlt(picture) : media?.alternativeText || '')}
      fill
      sizes={sizes}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      quality={75}
    />
  );
}
