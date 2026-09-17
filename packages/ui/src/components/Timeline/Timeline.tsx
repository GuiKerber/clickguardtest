import type { ReactNode } from 'react';
import { Dot, type DotTone } from '../Dot/Dot';
import { Icon } from '../Icon/Icon';
import './Timeline.css';

export type TimelineTone = DotTone;

export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="cg-timeline">{children}</ol>;
}

export interface TimelineItemProps {
  /**
   * Colours the marker by how healthy the journey is at this point — not by
   * what this one step did. Green while the total is low, amber as it climbs,
   * red once it has crossed the line.
   */
  tone?: TimelineTone;
  title: ReactNode;
  meta?: ReactNode;
  /** Why this entry moved the score. A sentence, not a signal name. */
  reason?: ReactNode;
  /** The score change, stated in full rather than left as a bare number. */
  score?: ReactNode;
  /** A marker belonging to this entry, such as the moment of blocking. */
  tag?: ReactNode;
}

export function TimelineItem({ tone = 'neutral', title, meta, reason, score, tag }: TimelineItemProps) {
  return (
    <li className="cg-timeline__item">
      <span className="cg-timeline__marker">
        <Dot tone={tone} />
      </span>

      <span className="cg-timeline__content">
        <span className="cg-timeline__title">{title}</span>
        {meta && <span className="cg-timeline__meta">{meta}</span>}
        {reason && <span className="cg-timeline__reason">{reason}</span>}
        {score && <span className="cg-timeline__score">{score}</span>}
        {tag && <span className="cg-timeline__tag-slot">{tag}</span>}
      </span>
    </li>
  );
}

/**
 * What an entry cost, beside the title it belongs to.
 *
 * Secondary, never primary: the money is a fact about the visit, not the visit
 * itself. Fixed-width figures, so a column of entries lines up down the rail.
 */
export function TimelineCost({ children }: { children: ReactNode }) {
  return <span className="cg-timeline__cost">{children}</span>;
}

export interface TimelineDeltaProps {
  /** Rounded before printing: runs carry fractional weights, readers do not. */
  value: number;
}

/**
 * How far this entry moved the score, with the sign the direction deserves.
 *
 * Up is bad and down is good, which is the opposite of what a reader expects
 * from a rising number — so the direction is stated twice, once by the sign and
 * once by the colour, and never by the colour alone.
 */
export function TimelineDelta({ value }: TimelineDeltaProps) {
  const rounded = Math.round(value);
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat';
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';

  return (
    <span className="cg-timeline__delta" data-direction={direction}>
      {sign}
      {Math.abs(rounded)}
    </span>
  );
}

export interface TimelineThresholdProps {
  children: ReactNode;
}

/** Marks the entry where the running total crossed the blocking line. */
export function TimelineThreshold({ children }: TimelineThresholdProps) {
  return (
    <span className="cg-timeline__threshold-tag">
      <Icon name="shield-blocked" size="sm" />
      {children}
    </span>
  );
}
