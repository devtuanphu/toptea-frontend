const number = new Intl.NumberFormat('vi-VN');

/** 145000 -> "145.000₫" */
export const formatPrice = (value: number, suffix = '₫') => `${number.format(Math.round(value || 0))}${suffix}`;

/** "2026-10-07" -> "07.10.2026" */
export function formatDate(value?: string | null) {
  if (!value) return '';
  const [y, m, d] = value.slice(0, 10).split('-');
  return d && m && y ? `${d}.${m}.${y}` : value;
}

/** ISO datetime -> "07.10 · 09:12" in Vietnam time. */
export function formatDateTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return `${get('day')}.${get('month')} · ${get('hour')}:${get('minute')}`;
}

/** Replace `{key}` placeholders in CMS label templates. */
export const fill = (template: string | undefined, values: Record<string, string | number>) =>
  (template || '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

/** Lowercase, accent-free text for client-side matching. */
export const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
