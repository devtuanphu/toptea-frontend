import Rt from './Rt';

type Props = {
  children?: string;
  /** Shorter label for phones (optional). */
  mobile?: string | null;
  lines?: 'none' | 'left' | 'both';
  className?: string;
};

/** Small uppercase label above headings, optionally framed by thin rules. */
export default function Eyebrow({ children, mobile, lines = 'none', className = '' }: Props) {
  if (!children) return null;
  return (
    <p className={`eyebrow eyebrow--${lines} ${className}`}>
      {lines !== 'none' && <span className="eyebrow__rule" aria-hidden="true" />}
      <span>
        <Rt d={children} m={mobile} />
      </span>
      {lines === 'both' && <span className="eyebrow__rule" aria-hidden="true" />}
    </p>
  );
}
