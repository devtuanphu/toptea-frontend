import Eyebrow from '@/components/ui/Eyebrow';
import Icon from '@/components/ui/Icon';
import SmartLink from '@/components/ui/SmartLink';
import type { FormField, MediaFile, Section, SiteContext } from '@/lib/types';
import { ContactForm, NewsletterForm } from './forms';

export function Newsletter({ section }: { section: Section }) {
  return (
    <section className="newsletter" id={section.anchorId || undefined}>
      <Eyebrow className="eyebrow--light">{section.eyebrow}</Eyebrow>
      <h2 className="h2">{section.title}</h2>
      {section.description && <p className="body newsletter__desc">{section.description}</p>}
      <NewsletterForm
        placeholder={section.emailPlaceholder}
        buttonLabel={section.buttonLabel}
        successMessage={section.successMessage}
        errorMessage={section.errorMessage}
        source={`section-${section.id}`}
      />
    </section>
  );
}

export function ContactPanel({ section, site }: { section: Section; site: SiteContext }) {
  const items = (section.items || []) as { id?: number; icon?: MediaFile; label: string; value: string; url?: string }[];
  return (
    <section className="contact-panel">
      <div className="contact-panel__info">
        <h2 className="h3">{section.infoTitle}</h2>
        <ul className="contact-panel__list">
          {items.map((item, i) => (
            <li key={item.id ?? i}>
              <Icon file={item.icon} size={22} />
              <div>
                <p className="label muted">{item.label}</p>
                {item.url ? (
                  <SmartLink href={item.url} className="body contact-panel__value">
                    {item.value}
                  </SmartLink>
                ) : (
                  <p className="body contact-panel__value">{item.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {section.showSocials && (
          <div className="social social--dark">
            {(site.global.socials || []).map((s, i) => (
              <a key={s.id ?? i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                <Icon file={s.icon} size={24} />
              </a>
            ))}
          </div>
        )}
      </div>
      <ContactForm
        title={section.formTitle}
        nameField={section.nameField as FormField}
        emailField={section.emailField as FormField}
        phoneField={section.phoneField as FormField}
        topicField={section.topicField as FormField}
        topics={section.topics || []}
        messageField={section.messageField as FormField}
        submitLabel={section.submitLabel}
        successMessage={section.successMessage}
        errorMessage={section.errorMessage}
      />
    </section>
  );
}
