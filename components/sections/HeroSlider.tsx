import CmsImage from '@/components/ui/CmsImage';
import Eyebrow from '@/components/ui/Eyebrow';
import SmartLink from '@/components/ui/SmartLink';
import Rt from '@/components/ui/Rt';
import type { Picture, Section } from '@/lib/types';
import HeroSliderClient from './HeroSliderClient';
import { lines } from './content';

type Slide = {
  id?: number;
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  image?: Picture;
  mobileTitle?: string;
  mobileDescription?: string;
};

export default function HeroSlider({ section }: { section: Section }) {
  const slides = (section.slides || []) as Slide[];
  if (!slides.length) return null;
  const rendered = slides.map((slide, i) => {
    // Only the first slide carries the page H1.
    const Heading = i === 0 ? 'h1' : 'h2';
    return (
      <div key={slide.id ?? i} className="hero-slide">
        <div className="hero-slide__bg" aria-hidden="true">
          <CmsImage picture={slide.image} alt="" sizes="100vw" priority={i === 0} />
        </div>
        <div className="hero-slide__content">
          <Eyebrow lines="left" className="eyebrow--light">
            {slide.eyebrow}
          </Eyebrow>
          <Heading className="h1 hero-slide__title">
            <Rt d={lines(slide.title)} m={slide.mobileTitle} />
          </Heading>
          {slide.description && (
            <p className="body hero-slide__desc">
              <Rt d={slide.description} m={slide.mobileDescription} />
            </p>
          )}
          {slide.ctaLabel && (
            <SmartLink href={slide.ctaUrl} className="hero-slide__cta">
              {slide.ctaLabel}
              <span className="hero-slide__cta-rule" aria-hidden="true" />
            </SmartLink>
          )}
        </div>
      </div>
    );
  });
  return (
    <HeroSliderClient
      slides={rendered}
      labels={slides.map((s) => s.title.replace(/\n/g, ' '))}
      interval={Number(section.autoplaySeconds) || 0}
    />
  );
}
