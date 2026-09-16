import './Dot.css';

export type DotTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface DotProps {
  tone?: DotTone;
  className?: string;
}

/**
 * Decorative by design — always pair it with the sentence it colours, never use
 * it as the only signal.
 */
export function Dot({ tone = 'neutral', className }: DotProps) {
  return (
    <span
      className={['cg-dot', tone !== 'neutral' && `cg-dot--${tone}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}
