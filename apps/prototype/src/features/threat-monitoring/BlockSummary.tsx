import type { Visitor } from '../../data/types';
import { BLOCK_THRESHOLD, formatDateTime, formatMoney, isPaid, metricsOf } from '../../data/derive';

const DAY = 24 * 60 * 60 * 1000;

/**
 * The short version, for the customer who wants the answer before the evidence.
 *
 * Every line is read from the same data as the timeline below it — nothing here
 * is written per visitor, so the summary can never drift from what the ledger
 * actually shows.
 */
export function BlockSummary({ visitor }: { visitor: Visitor }) {
  const metrics = metricsOf(visitor);
  const paidVisits = visitor.visits.filter((visit) => isPaid(visit.source));
  if (paidVisits.length === 0) return null;

  const span = Math.max(
    1,
    Math.round((paidVisits[paidVisits.length - 1].at - paidVisits[0].at) / DAY),
  );

  const reasons = visitor.signals
    .filter((signal) => signal.verdict === 'incriminating')
    .slice(0, 3)
    // No case juggling: these strings carry acronyms and network names that
    // lower-casing would mangle into nonsense.
    .map((signal) => `${signal.label}: ${signal.value}`);

  const steps = [
    `${metrics.paidVisits} paid clicks over ${span} day${span > 1 ? 's' : ''}, costing ${formatMoney(metrics.wasted)}`,
    ...reasons,
  ];

  return (
    <aside className="vd__summary">
      <h4 className="vd__summary-title">Why this visitor was blocked</h4>

      <ol className="vd__summary-steps">
        {steps.map((step, index) => (
          <li key={step} className="vd__summary-step">
            <span className="vd__summary-index" aria-hidden="true">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="vd__summary-result">
        Together these took the score to <strong>{visitor.riskScore}</strong>, past the{' '}
        {BLOCK_THRESHOLD} mark.
        {visitor.blockedAt && ` The address was excluded on ${formatDateTime(visitor.blockedAt)}.`}
      </p>
    </aside>
  );
}
