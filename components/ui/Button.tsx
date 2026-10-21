import type { ButtonItem } from '@/lib/types';
import SmartLink from './SmartLink';

/** CMS button rendered as a link with the design's asymmetric rounded shape. */
export default function Button({ button, className = '' }: { button?: ButtonItem | null; className?: string }) {
  if (!button?.label) return null;
  return (
    <SmartLink href={button.url} className={`btn btn--${button.variant || 'primary'} ${className}`}>
      {button.label}
    </SmartLink>
  );
}

export function ButtonRow({ buttons, className = '' }: { buttons?: ButtonItem[]; className?: string }) {
  if (!buttons?.length) return null;
  return (
    <div className={`btn-row ${className}`}>
      {buttons.map((button, i) => (
        <Button key={button.id ?? i} button={button} />
      ))}
    </div>
  );
}
