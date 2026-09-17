import type { ReactNode } from 'react';
import './CaseSummary.css';

export interface CaseSummaryProps {
  title: ReactNode;
  /** The numbered facts, in the order they were established. */
  steps: ReactNode[];
  /** What the steps add up to. */
  children: ReactNode;
}

/**
 * The short version, for the reader who wants the answer before the evidence.
 *
 * Numbered rather than bulleted: the point is that a case was built one fact at
 * a time, and a bullet list says only that several things are true. The
 * conclusion sits below a rule, so it reads as the sum rather than as a fourth
 * item.
 *
 * Every line is written by the caller from the same data as the ledger beneath
 * it — nothing here should be authored per case, or the summary will drift from
 * what the record actually shows.
 */
export function CaseSummary({ title, steps, children }: CaseSummaryProps) {
  /* A plain div, not an `aside`. An `aside` is the `complementary` landmark,
     and a landmark is a top-level destination a screen-reader user jumps
     between — this block lives inside a panel that is already one, so marking
     it up that way put two "complementary" regions on the page and made the
     panel harder to find rather than easier. The heading is what gives this
     block its place in the outline. */
  return (
    <div className="cg-case">
      <h4 className="cg-case__title">{title}</h4>

      <ol className="cg-case__steps">
        {steps.map((step, index) => (
          <li key={index} className="cg-case__step">
            {/* The figure is a position in the list, which the ordered list
                already conveys to a screen reader — spoken twice it becomes
                "one one". */}
            <span className="cg-case__index" aria-hidden="true">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="cg-case__result">{children}</p>
    </div>
  );
}
