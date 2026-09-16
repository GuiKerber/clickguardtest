import { useId, useState } from 'react';
import { Icon } from '@clickguard/ui';
import type { Signal } from '../../data/types';

const verdictWord: Record<Signal['verdict'], string> = {
  incriminating: 'Counts against',
  exonerating: 'Counts in favour',
  neutral: 'Inconclusive',
};

const verdictEffect: Record<Signal['verdict'], string> = {
  incriminating: 'This pushed the risk score up.',
  exonerating: 'This pulled the risk score down.',
  neutral: 'On its own, this did not move the risk score.',
};

/**
 * The finding is always visible; the explanation is one click away. A customer
 * who already trusts the verdict should not have to read six paragraphs, and a
 * customer who does not should not have to call support to get them.
 */
export function SignalCard({ signal }: { signal: Signal }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <article className={`vd__signal vd__signal--${signal.verdict}`}>
      <button
        type="button"
        className="vd__signal-head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="vd__signal-text">
          <span className="vd__signal-label">{signal.label}</span>
          <span className="vd__signal-value">{signal.value}</span>
        </span>

        <span className="vd__signal-aside">
          <span className="vd__signal-verdict">{verdictWord[signal.verdict]}</span>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" className="vd__signal-chevron" />
        </span>
      </button>

      {open && (
        <div className="vd__signal-body" id={bodyId}>
          <p>{signal.explain}</p>
          <p className="vd__signal-effect">{verdictEffect[signal.verdict]}</p>
        </div>
      )}
    </article>
  );
}
