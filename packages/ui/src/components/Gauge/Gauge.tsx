import type { CSSProperties, ReactNode } from 'react';
import './Gauge.css';

export interface GaugeProps {
  value: number;
  max?: number;
  /** Sits under the number, inside the arc. */
  label?: ReactNode;
  /** Sits under the whole dial. */
  caption?: ReactNode;
  /** Announced to assistive tech, which cannot see the dial. */
  ariaLabel: string;
  segments?: number;
}

/* Geometry in viewBox units. The arc nearly fills the box so the dial sits
   close to the number it describes rather than orbiting it. */
const CX = 100;
const CY = 100;
const OUTER_R = 97;
const INNER_R = 79;

/** The space between two neighbouring segments, identical at every radius. */
const GAP = 2.5;
const CORNER_R = 3;

type Point = [number, number];

function distance(a: Point, b: Point) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Unit vector pointing from `from` towards `to`. */
function direction(from: Point, to: Point): Point {
  const length = distance(from, to) || 1;
  return [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
}

/** A closed polygon with every corner rounded. */
function roundedPolygon(points: Point[], radius: number) {
  return (
    points
      .map((corner, index) => {
        const previous = points[(index - 1 + points.length) % points.length];
        const next = points[(index + 1) % points.length];

        const toPrevious = direction(corner, previous);
        const toNext = direction(corner, next);
        const backOff = Math.min(radius, distance(corner, previous) / 2);
        const runOn = Math.min(radius, distance(corner, next) / 2);

        const start: Point = [corner[0] + toPrevious[0] * backOff, corner[1] + toPrevious[1] * backOff];
        const end: Point = [corner[0] + toNext[0] * runOn, corner[1] + toNext[1] * runOn];

        const move = index === 0 ? 'M' : 'L';
        return `${move} ${start[0].toFixed(2)} ${start[1].toFixed(2)} Q ${corner[0].toFixed(2)} ${corner[1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
      })
      .join(' ') + ' Z'
  );
}

/* Three legs: green → yellow, yellow → brown, brown → red. */
const LEGS = ['g1', 'g2', 'g3'] as const;

/**
 * A segmented arc.
 *
 * Each segment is a tapered wedge, not a rectangle: the outer end has more arc
 * to cover than the inner end, so a constant-width bar leaves a gap that fans
 * open towards the outside. Sizing each end to its own arc length keeps the
 * space between neighbours identical at every radius.
 *
 * Colour comes from the scale, not the value. Each filled segment takes one
 * flat sample of a green → yellow → brown → red gradient at its own position,
 * so a full dial reads as a journey from safe to fatal.
 */
export function Gauge({ value, max = 100, label, caption, ariaLabel, segments = 24 }: GaugeProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const filled = Math.round((clamped / max) * segments);

  const stepDegrees = 180 / (segments - 1);
  const stepRadians = Math.PI / (segments - 1);

  // Half-widths sized to the arc available at each radius, minus the shared gap.
  const outerHalf = (OUTER_R * stepRadians - GAP) / 2;
  const innerHalf = (INNER_R * stepRadians - GAP) / 2;

  const shape = roundedPolygon(
    [
      [CX - outerHalf, CY - OUTER_R],
      [CX + outerHalf, CY - OUTER_R],
      [CX + innerHalf, CY - INNER_R],
      [CX - innerHalf, CY - INNER_R],
    ],
    CORNER_R,
  );

  return (
    <div className="cg-gauge">
      <svg className="cg-gauge__arc" viewBox="0 0 200 107" role="img" aria-label={ariaLabel}>
        {Array.from({ length: segments }, (_, index) => {
          const position = index / (segments - 1);
          const leg = Math.min(LEGS.length - 1, Math.floor(position * LEGS.length));
          const mix = position * LEGS.length - leg;

          return (
            <path
              key={index}
              d={shape}
              className={[
                'cg-gauge__segment',
                index < filled && 'cg-gauge__segment--on',
                index < filled && `cg-gauge__segment--${LEGS[leg]}`,
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--gauge-mix': mix.toFixed(3) } as CSSProperties}
              /* -90deg points at the left end of the arc, +90deg at the right. */
              transform={`rotate(${-90 + index * stepDegrees} ${CX} ${CY})`}
            />
          );
        })}
      </svg>

      <div className="cg-gauge__center">
        <span className="cg-gauge__value">{clamped}</span>
        {label && <span className="cg-gauge__label">{label}</span>}
      </div>

      {caption && <p className="cg-gauge__caption">{caption}</p>}
    </div>
  );
}
