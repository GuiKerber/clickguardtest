import type { ReactNode } from 'react';
import './ScoreCard.css';

export interface ScoreCardProps {
  children: ReactNode;
  /**
   * Caveats attached to the verdict — a callout saying the address is shared,
   * or that the exclusion has not reached the ad platform yet. They sit under
   * the card rather than inside it: they qualify the verdict, they are not part
   * of it.
   */
  aside?: ReactNode;
  className?: string;
}

/**
 * The block a detail panel opens with: a score and the money it stands for.
 *
 * The two belong in one frame because neither means anything alone — a risk of
 * 96 is a number until it is priced, and $739 wasted is a complaint until
 * something explains it. Everything drawn inside comes from elsewhere in this
 * system; the card only holds them together.
 */
export function ScoreCard({ children, aside, className }: ScoreCardProps) {
  return (
    <div className={['cg-score', className].filter(Boolean).join(' ')}>
      <div className="cg-score__card">{children}</div>
      {aside}
    </div>
  );
}
