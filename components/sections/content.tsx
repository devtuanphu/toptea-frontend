import CmsImage from '@/components/ui/CmsImage';
import Eyebrow from '@/components/ui/Eyebrow';
import Icon from '@/components/ui/Icon';
import FaqItem from './FaqItem';
import Rt, { mobileHidden } from '@/components/ui/Rt';
import SmartLink from '@/components/ui/SmartLink';
import { ButtonRow } from '@/components/ui/Button';
import { jsonLd } from '@/lib/seo';
import type { ButtonItem, LinkItem, NumberedItem, Picture, Section, SiteContext, TextCard } from '@/lib/types';

const lines = (text?: string) =>
  (text || '').split('\n').map((line, i, all) => (
    <span key={i}>
      {line}
      {i < all.length - 1 && <br />}
    </span>
  ));

/** Inner-page hero: image with navy gradient, eyebrow, H1, intro. */
export function PageBanner({ section }: { section: Section }) {
  return (
    <section className={`page-banner page-banner--${section.size || 'default'}`}>
      <div className="page-banner__bg" aria-hidden="true">
        <CmsImage picture={section.image as Picture} alt="" sizes="100vw" priority />
      </div>
      <div className="page-banner__content">
        <Eyebrow className="eyebrow--light">{section.eyebrow}</Eyebrow>
        <h1 className={section.size === 'large' ? 'display' : 'h1'}>
          <Rt d={section.title} m={section.mobileTitle} />
        </h1>
        {section.description && (
          <p className={`body-lg page-banner__desc${mobileHidden(section.hideDescriptionOnMobile)}`}>
            <Rt d={section.description} m={section.mobileDescription} />
          </p>
        )}
      </div>
    </section>
  );
}

export function SplitStory({ section, site }: { section: Section; site: SiteContext }) {
  const link = section.link as LinkItem | null;
  const classes = [
    'split',
    `split--${section.layout || 'inset'}`,
    `split--${section.theme || 'white'}`,
    `split--image-${section.imagePosition || 'right'}`,
  ].join(' ');
  return (
    <section className={classes} id={section.anchorId || undefined}>
      <div className="split__media">
        <CmsImage picture={section.image as Picture} sizes="(max-width: 767px) 100vw, 50vw" />
      </div>
      <div className="split__text">
        <Eyebrow lines={section.showEyebrowLine ? 'left' : 'none'}>{section.eyebrow}</Eyebrow>
        <h2 className={section.titleSize === 'large' ? 'h1' : 'h2'}>
          <Rt d={section.title} m={section.mobileTitle} />
        </h2>
        {section.body && (
          <p className="body-lg split__body">
            <Rt d={section.body} m={section.mobileBody} />
          </p>
        )}
        {link?.label && (
          <SmartLink href={link.url} newTab={link.openInNewTab} className="text-link">
            {link.label}
            <Icon file={site.icons.arrowRight} size={18} />
          </SmartLink>
        )}
      </div>
    </section>
  );
}

export function ImageBand({ section }: { section: Section }) {
  return (
    <div className="image-band">
      <CmsImage picture={section.image as Picture} sizes="100vw" />
    </div>
  );
}

export function QuoteBand({ section }: { section: Section }) {
  return (
    <section className="quote-band">
      <figure>
        <blockquote className="quote">
          <Rt d={section.quote} m={section.mobileQuote} />
        </blockquote>
        {section.author && <figcaption className="eyebrow eyebrow--light">{section.author}</figcaption>}
      </figure>
    </section>
  );
}

export function CtaBand({ section }: { section: Section }) {
  return (
    <section className={`cta-band cta-band--${section.theme || 'navy'}`} id={section.anchorId || undefined}>
      <Eyebrow lines="both" className={section.theme === 'white' ? '' : 'eyebrow--light'}>
        {section.eyebrow}
      </Eyebrow>
      <h2 className={section.theme === 'white' ? 'h2' : 'h1'}>{section.title}</h2>
      {section.description && (
        <p className="body-lg cta-band__desc">
          <Rt d={section.description} m={section.mobileDescription} />
        </p>
      )}
      <ButtonRow buttons={section.buttons as ButtonItem[]} />
    </section>
  );
}

export function CardGrid({ section }: { section: Section }) {
  const cards = (section.cards || []) as TextCard[];
  return (
    <section className={`card-grid card-grid--${section.theme || 'light'}`} id={section.anchorId || undefined}>
      <div className="section-head section-head--center">
        <Eyebrow>{section.eyebrow}</Eyebrow>
        <h2 className="h2">
          <Rt d={section.title} m={section.mobileTitle} />
        </h2>
      </div>
      <ul className="card-grid__list">
        {cards.map((card, i) => (
          <li key={card.id ?? i} className="info-card">
            {card.icon && <Icon file={card.icon} size={28} />}
            <h3 className="h4">{card.title}</h3>
            {card.description && (
              <p className="body-sm muted">
                <Rt d={card.description} m={card.mobileDescription} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq({ section, site }: { section: Section; site: SiteContext }) {
  const items = (section.items || []) as {
    id?: number;
    question: string;
    answer?: string;
    openByDefault?: boolean;
    closeOnMobile?: boolean;
    mobileAnswer?: string;
    hideOnMobile?: boolean;
  }[];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
      .filter((i) => i.answer)
      .map((i) => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.answer } })),
  };
  return (
    <section className="faq" id={section.anchorId || undefined}>
      <h2 className="h2">{section.title}</h2>
      <div className="faq__list">
        {items.map((item, i) => (
          <FaqItem
            key={item.id ?? i}
            className={`faq__item${mobileHidden(item.hideOnMobile)}`}
            open={item.openByDefault}
            closeOnMobile={item.closeOnMobile}
          >
            <summary>
              <span className="h4">{item.question}</span>
              <Icon file={site.icons.chevronDown} size={22} className="faq__chevron" />
            </summary>
            {item.answer && (
              <p className="body muted">
                <Rt d={item.answer} m={item.mobileAnswer} />
              </p>
            )}
          </FaqItem>
        ))}
      </div>
      {schema.mainEntity.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      )}
    </section>
  );
}

export function Philosophy({ section }: { section: Section }) {
  const pillars = (section.pillars || []) as NumberedItem[];
  return (
    <section className="philosophy">
      <div className="philosophy__head">
        <Eyebrow lines="both" mobile={section.mobileEyebrow}>
          {section.eyebrow}
        </Eyebrow>
        <h2 className="quote philosophy__statement">
          <Rt d={section.statement} m={section.mobileStatement} />
        </h2>
      </div>
      <ol className="philosophy__pillars">
        {pillars.map((p, i) => (
          <li key={p.id ?? i}>
            <span className="philosophy__num" aria-hidden="true">
              {p.number}
            </span>
            <h3 className="h3">{p.title}</h3>
            {p.description && (
              <p className="body muted">
                <Rt d={p.description} m={p.mobileDescription} />
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Process({ section }: { section: Section }) {
  const stages = (section.stages || []) as {
    id?: number;
    label?: string;
    title: string;
    description?: string;
    mobileDescription?: string;
    image?: Picture;
  }[];
  return (
    <section className="process">
      <SectionHead
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        mobileDescription={section.mobileDescription}
      />
      <ol className="process__stages">
        {stages.map((stage, i) => (
          <li key={stage.id ?? i} className="process__stage">
            <div className="process__media">
              <CmsImage picture={stage.image} sizes="(max-width: 767px) 50vw, 25vw" />
            </div>
            <p className="eyebrow">{stage.label}</p>
            <h3 className="h4">{stage.title}</h3>
            {stage.description && (
              <p className="body-sm muted">
                <Rt d={stage.description} m={stage.mobileDescription} />
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Header row used by Process / Featured products: rule, eyebrow + H2 left, intro right. */
export function SectionHead({
  eyebrow,
  title,
  description,
  mobileDescription,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  mobileDescription?: string;
}) {
  return (
    <div className="section-head section-head--split">
      <div className="section-head__rule" aria-hidden="true" />
      <div className="section-head__row">
        <div>
          <Eyebrow lines="left">{eyebrow}</Eyebrow>
          <h2 className="h2">{title}</h2>
        </div>
        {description && (
          <p className="body muted section-head__desc">
            <Rt d={description} m={mobileDescription} />
          </p>
        )}
      </div>
    </div>
  );
}

export function BrewGuides({ section }: { section: Section }) {
  const guides = (section.guides || []) as TextCard[];
  return (
    <section className="brew-guides">
      <h2 className="h2">{section.title}</h2>
      <ul className="brew-guides__list">
        {guides.map((g, i) => (
          <li key={g.id ?? i} className="info-card info-card--white">
            <Icon file={g.icon} size={28} />
            <h3 className="h4">{g.title}</h3>
            {g.description && (
              <p className="body muted">
                <Rt d={g.description} m={g.mobileDescription} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UsageSteps({ section }: { section: Section }) {
  const steps = (section.steps || []) as NumberedItem[];
  return (
    <section className="usage-steps">
      <div className="section-head section-head--center">
        <Eyebrow className="eyebrow--light">{section.eyebrow}</Eyebrow>
        <h2 className="h2">{section.title}</h2>
      </div>
      <ol className="usage-steps__list">
        {steps.map((s, i) => (
          <li key={s.id ?? i}>
            <span className="usage-steps__num" aria-hidden="true">
              {s.number}
            </span>
            <h3 className="h4">{s.title}</h3>
            {s.description && (
              <p className="body">
                <Rt d={s.description} m={s.mobileDescription} />
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function NotFoundSection({ section }: { section: Section }) {
  const suggestions = (section.suggestions || []) as LinkItem[];
  return (
    <section className="not-found">
      <p className="not-found__code" aria-hidden="true">
        {section.code}
      </p>
      <Eyebrow>{section.eyebrow}</Eyebrow>
      <h1 className="h1">{section.title}</h1>
      {section.description && (
        <p className="body-lg muted not-found__desc">
          <Rt d={section.description} m={section.mobileDescription} />
        </p>
      )}
      <ButtonRow buttons={section.buttons as ButtonItem[]} />
      {suggestions.length > 0 && (
        <nav className="not-found__links" aria-label={section.suggestionsLabel}>
          <span className="label muted">{section.suggestionsLabel}</span>
          {suggestions.map((s, i) => (
            <SmartLink key={s.id ?? i} href={s.url} className="label">
              {s.label}
            </SmartLink>
          ))}
        </nav>
      )}
    </section>
  );
}

export { lines };
