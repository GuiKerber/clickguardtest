import type { ReactNode } from 'react';
import './Progress.css';

export type ProgressTone = 'default' | 'clean' | 'suspicious' | 'malicious';

export type ProgressLayout = 'stacked' | 'inline';

export interface ProgressProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  /**
   * 'stacked' puts the labels above a full-height bar — for cards and panels.
   * 'inline' puts the number to the left of a slim bar — for table rows, where
   * vertical space is the scarce resource.
   */
  layout?: ProgressLayout;
  /** Shown on the left of the bar. Omit to render the bar alone. */
  label?: ReactNode;
  /** The bar never ships without its number. */
  valueLabel?: ReactNode;
  /** Required when `label` is omitted, so the bar is still announced. */
  ariaLabel?: string;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  tone = 'default',
  layout = 'stacked',
  label,
  valueLabel,
  ariaLabel,
  className,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = (clamped / max) * 100;
  const classes = [
    'cg-progress',
    `cg-progress--${layout}`,
    tone !== 'default' && `cg-progress--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const track = (
    <div className="cg-progress__track">
      <div className="cg-progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      {layout === 'inline' ? (
        <>
          {valueLabel !== undefined && <span className="cg-progress__value">{valueLabel}</span>}
          {track}
        </>
      ) : (
        <>
          {(label || valueLabel !== undefined) && (
            <div className="cg-progress__header">
              <span>{label}</span>
              {valueLabel !== undefined && <span className="cg-progress__value">{valueLabel}</span>}
            </div>
          )}
          {track}
        </>
      )}
    </div>
  );
}
