import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Section.css';

export interface SectionProps {
  title: ReactNode;
  /** One line under the title. Stays visible when the section is closed. */
  note?: ReactNode;
  /** Sits on the title row, before the arrow — a count, a status. */
  aside?: ReactNode;
  /** Open on first render. The reader's later choice is theirs to keep. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * A titled block the reader can fold away.
 *
 * The whole heading row is the control, not just the arrow — a 16px target for
 * an action the entire row already looks like it performs is a target most
 * people miss. The arrow still turns, because it is what says the row can be
 * pressed at all.
 *
 * The note stays visible when closed: a folded section should still say what is
 * inside it, or folding it costs the reader the ability to find it again.
 */
export function Section({ title, note, aside, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section className="cg-section" data-open={open || undefined}>
      <h3 className="cg-section__heading">
        <button
          type="button"
          className="cg-section__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="cg-section__title">{title}</span>
          {aside && <span className="cg-section__aside">{aside}</span>}
          <Icon name="chevron-down" size="sm" className="cg-section__arrow" />
        </button>
      </h3>

      {note && <p className="cg-section__note">{note}</p>}

      <div className="cg-section__body" id={bodyId} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
