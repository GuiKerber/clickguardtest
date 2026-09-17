import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Signal.css';

export type SignalVerdict = 'incriminating' | 'exonerating' | 'neutral';

const verdictWord: Record<SignalVerdict, string> = {
  incriminating: 'Counts against',
  exonerating: 'Counts in favour',
  neutral: 'Inconclusive',
};

const verdictEffect: Record<SignalVerdict, string> = {
  incriminating: 'This pushed the risk score up.',
  exonerating: 'This pulled the risk score down.',
  neutral: 'On its own, this did not move the risk score.',
};

export interface SignalCardProps {
  /** What was measured. */
  label: ReactNode;
  /** What it measured to. */
  value: ReactNode;
  verdict?: SignalVerdict;
  /** The explanation, written for someone who does not run ad campaigns. */
  children?: ReactNode;
  /** Open on first render. */
  defaultOpen?: boolean;
}

/**
 * One piece of evidence, with its explanation one click away.
 *
 * The finding is always visible; the reasoning is not. Someone who already
 * trusts the verdict should not have to read six paragraphs, and someone who
 * does not should not have to call support to get them.
 *
 * The verdict is carried three ways — the word, the edge colour and the
 * sentence inside — because "counts against you" is the kind of claim a reader
 * is entitled to see stated, not inferred from a red stripe.
 */
export function SignalCard({ label, value, verdict = 'neutral', children, defaultOpen = false }: SignalCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <article className={`cg-signal cg-signal--${verdict}`}>
      <button
        type="button"
        className="cg-signal__head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="cg-signal__text">
          <span className="cg-signal__label">{label}</span>
          <span className="cg-signal__value">{value}</span>
        </span>

        <span className="cg-signal__aside">
          <span className="cg-signal__verdict">{verdictWord[verdict]}</span>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" className="cg-signal__chevron" />
        </span>
      </button>

      {open && (
        <div className="cg-signal__body" id={bodyId}>
          {children}
          <p className="cg-signal__effect">{verdictEffect[verdict]}</p>
        </div>
      )}
    </article>
  );
}

/**
 * A stack of signal cards. Closer together than the panel's other blocks: they
 * are one body of evidence, not a run of unrelated statements.
 */
export function SignalList({ children }: { children: ReactNode }) {
  return <div className="cg-signal-list">{children}</div>;
}
