import { useId, useState, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import './Section.css';

export interface SectionProps {
  title: ReactNode;
  /** One line under the title, inside the fold. */
  note?: ReactNode;
  /** Open on first render. The reader's later choice is theirs to keep. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * A titled block the reader can fold away.
 *
 * Folding hides everything except the title — the note included. A section that
 * keeps talking after being closed has not really closed, and the reader who
 * pressed the arrow is left wondering what the arrow did.
 */
export function Section({ title, note, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const label = typeof title === 'string' ? title : 'section';

  return (
    <section className="cg-section" data-open={open || undefined}>
      <div className="cg-section__heading">
        <h3 className="cg-section__title">{title}</h3>

        <Button
          className="cg-section__toggle"
          variant="tertiary"
          iconStart="chevron-down"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
          onClick={() => setOpen((value) => !value)}
        />
      </div>

      <div className="cg-section__body" id={bodyId} hidden={!open}>
        {note && <p className="cg-section__note">{note}</p>}
        {children}
      </div>
    </section>
  );
}
