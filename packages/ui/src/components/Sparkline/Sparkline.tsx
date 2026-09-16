import { useId } from 'react';
import './Sparkline.css';

export type SparklineTone = 'default' | 'success' | 'danger';

export interface SparklineProps {
  /** Values in order. Drawn against their own range, not a shared axis. */
  points: number[];
  tone?: SparklineTone;
  /**
   * Announced to assistive tech. Omit only when the number beside the chart
   * already says everything the chart does.
   */
  ariaLabel?: string;
  className?: string;
}

const WIDTH = 100;
const HEIGHT = 40;
/* Half the stroke, so the line never clips against the top or bottom edge. */
const INSET = 2;

/**
 * A chart with no axes, no grid and no labels.
 *
 * It answers one question — did this climb steadily, in bursts, or not at all —
 * and deliberately cannot answer any other. The figure beside it carries the
 * magnitude; drawing an axis here would invite the reader to measure a shape
 * that is only 100 units wide.
 */
export function Sparkline({ points, tone = 'default', ariaLabel, className }: SparklineProps) {
  const gradientId = useId();

  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  // A flat series would divide by zero; draw it along the baseline instead.
  const range = max - min || 1;
  const span = HEIGHT - INSET * 2;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * WIDTH;
    const y = HEIGHT - INSET - ((value - min) / range) * span;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const area = `${line} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;

  const classes = ['cg-sparkline', tone !== 'default' && `cg-sparkline--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={classes}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      focusable="false"
    >
      <defs>
        {/* currentColor throughout, so tone is one CSS property rather than a
            colour repeated in three places. */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="var(--sparkline-fill-from)" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="var(--sparkline-fill-to)" />
        </linearGradient>
      </defs>

      <path className="cg-sparkline__area" d={area} fill={`url(#${gradientId})`} />
      <path className="cg-sparkline__line" d={line} />
    </svg>
  );
}
