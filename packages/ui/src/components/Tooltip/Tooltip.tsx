import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Tooltip.css';

export interface InfoTipProps {
  /** Plain-language explanation. Written for someone who does not run ads. */
  children: ReactNode;
  /** Names the thing being explained, so the control has a real label. */
  term: string;
  align?: 'center' | 'end';
}

/**
 * Opens on hover and on keyboard focus, and closes on Escape — a tooltip that
 * only answers the mouse is not an explanation, it is decoration.
 */
export function InfoTip({ children, term, align = 'center' }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const tipId = useId();

  return (
    <span
      className="cg-tip-root"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="cg-tip-trigger"
        aria-label={`What is ${term}?`}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        /* Open, never toggle. A click lands on a trigger that focus has already
           opened, so a toggle here closes the tip the same gesture just asked
           for — and on touch, where there is no hover, that is the only gesture
           there is. Escape and blur are what close it. */
        onClick={() => setOpen(true)}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      >
        <Icon name="info" size="sm" />
      </button>

      {open && (
        <span className={['cg-tip', align === 'end' && 'cg-tip--end'].filter(Boolean).join(' ')} role="tooltip" id={tipId}>
          {children}
        </span>
      )}
    </span>
  );
}
