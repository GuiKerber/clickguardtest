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

type Point = readonly [number, number];

/**
 * A smooth path through every point, using monotone cubic interpolation
 * (Fritsch–Carlson).
 *
 * The choice of curve is not cosmetic. A plain spline through these points
 * overshoots at each corner, and an overshoot on a cumulative series draws a
 * dip that never happened — money appearing to come back. Constraining the
 * tangents keeps the curve rising wherever the data rises and flat wherever it
 * is flat, so the drawing cannot claim anything the numbers do not.
 */
function smoothPath(points: Point[]) {
  const last = points.length - 1;
  if (last < 1) return '';

  // Slope of each straight segment.
  const slopes = points.slice(0, last).map(([x1, y1], i) => {
    const [x2, y2] = points[i + 1];
    return (y2 - y1) / (x2 - x1);
  });

  // Tangent at each point: the average of its neighbours, clamped so the curve
  // stays monotone. A flat segment on either side pins the tangent to zero,
  // which is what keeps a plateau looking like a plateau.
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === last) return slopes[last - 1];

    const before = slopes[i - 1];
    const after = slopes[i];
    if (before * after <= 0) return 0;

    const average = (before + after) / 2;
    return Math.sign(average) * Math.min(Math.abs(average), 3 * Math.min(Math.abs(before), Math.abs(after)));
  });

  let path = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;

  for (let i = 0; i < last; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const third = (x2 - x1) / 3;

    const c1x = x1 + third;
    const c1y = y1 + tangents[i] * third;
    const c2x = x2 - third;
    const c2y = y2 - tangents[i + 1] * third;

    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  return path;
}

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

  const coords: Point[] = points.map((value, index) => {
    const x = (index / (points.length - 1)) * WIDTH;
    const y = HEIGHT - INSET - ((value - min) / range) * span;
    return [x, y] as const;
  });

  const line = smoothPath(coords);
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
