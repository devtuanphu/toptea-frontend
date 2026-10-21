'use client';

import { useState, type FormEvent } from 'react';
import { postJson } from '@/lib/client-api';
import type { FormField } from '@/lib/types';
import { useIsMobile } from '@/lib/use-mobile';
import Rt, { mobileHidden } from '@/components/ui/Rt';

type Status = { kind: 'idle' | 'sending' | 'success' | 'error'; message?: string };

/** Hidden field that real visitors never fill; bots usually do. */
function Honeypot() {
  return (
    <div className="visually-hidden" aria-hidden="true">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function NewsletterForm({
  placeholder,
  buttonLabel,
  successMessage,
  errorMessage,
  source,
}: {
  placeholder?: string;
  buttonLabel: string;
  successMessage?: string;
  errorMessage?: string;
  source: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ kind: 'sending' });
    const res = await postJson('/api/newsletter', {
      email: form.get('email'),
      website: form.get('website'),
      source,
    });
    setStatus(res.ok ? { kind: 'success', message: successMessage } : { kind: 'error', message: errorMessage });
  }

  if (status.kind === 'success')
    return (
      <p className="form-status form-status--success" role="status">
        {status.message}
      </p>
    );

  return (
    <form className="newsletter__form" onSubmit={submit} noValidate={false}>
      <label className="visually-hidden" htmlFor={`newsletter-${source}`}>
        Email
      </label>
      <input
        id={`newsletter-${source}`}
        className="newsletter__input"
        type="email"
        name="email"
        required
        maxLength={254}
        autoComplete="email"
        placeholder={placeholder}
      />
      <Honeypot />
      <button type="submit" className="btn btn--light" disabled={status.kind === 'sending'}>
        {buttonLabel}
      </button>
      {status.kind === 'error' && (
        <p className="form-status form-status--error" role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}

export function Field({
  field,
  name,
  type = 'text',
  required,
  autoComplete,
  maxLength = 200,
  defaultValue,
}: {
  field: FormField;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  defaultValue?: string;
}) {
  const isMobile = useIsMobile();
  if (!field) return null;
  const id = `field-${name}`;
  return (
    <div className={`field${mobileHidden(field.hideOnMobile)}`}>
      <label htmlFor={id} className="field__label">
        <Rt d={field.label} m={field.mobileLabel} />
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="field__input"
        placeholder={(isMobile && field.mobilePlaceholder) || field.placeholder}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export function ContactForm({
  title,
  nameField,
  emailField,
  phoneField,
  topicField,
  topics,
  messageField,
  submitLabel,
  successMessage,
  errorMessage,
}: {
  title: string;
  nameField: FormField;
  emailField: FormField;
  phoneField: FormField;
  topicField: FormField;
  topics: { label: string; value?: string }[];
  messageField: FormField;
  submitLabel: string;
  successMessage?: string;
  errorMessage?: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const isMobile = useIsMobile();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus({ kind: 'sending' });
    const res = await postJson('/api/contact', Object.fromEntries(form.entries()));
    if (res.ok) {
      formElement.reset();
      setStatus({ kind: 'success', message: successMessage });
    } else setStatus({ kind: 'error', message: errorMessage });
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h2 className="h3">{title}</h2>
      <div className="field-row">
        <Field field={nameField} name="name" required autoComplete="name" maxLength={100} />
        <Field field={emailField} name="email" type="email" required autoComplete="email" maxLength={254} />
      </div>
      {phoneField && <Field field={phoneField} name="phone" type="tel" autoComplete="tel" maxLength={20} />}
      {topicField && (
        <div className="field">
          <label htmlFor="field-topic" className="field__label">
            {topicField.label}
          </label>
          <select id="field-topic" name="topic" className="field__input field__select" defaultValue="">
            <option value="" disabled>
              {(isMobile && topicField.mobilePlaceholder) || topicField.placeholder}
            </option>
            {topics.map((t) => (
              <option key={t.label} value={t.value || t.label}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {messageField && (
        <div className="field">
          <label htmlFor="field-message" className="field__label">
            {messageField.label}
          </label>
          <textarea
            id="field-message"
            name="message"
            className="field__input field__textarea"
            placeholder={(isMobile && messageField.mobilePlaceholder) || messageField.placeholder}
            required
            minLength={5}
            maxLength={5000}
            rows={5}
          />
        </div>
      )}
      <Honeypot />
      <div>
        <button type="submit" className="btn btn--primary" disabled={status.kind === 'sending'}>
          {submitLabel}
        </button>
      </div>
      {status.kind === 'success' && (
        <p className="form-status form-status--success" role="status">
          {status.message}
        </p>
      )}
      {status.kind === 'error' && (
        <p className="form-status form-status--error" role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}
