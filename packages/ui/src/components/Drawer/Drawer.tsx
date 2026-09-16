import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import './Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Sits on the close button's row. Use it for the record's status. */
  badge?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Drawer({ open, onClose, title, subtitle, badge, footer, children }: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="cg-drawer-scrim" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className="cg-drawer"
        role="complementary"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* Title and close button share the top line, so the record's name sits
            on the same baseline as the only control that dismisses it. The
            verdict is not here: it belongs beside the score that produced it,
            and repeating it in the header made the panel open with two
            competing first things to read. */}
        <header className="cg-drawer__header">
          <div className="cg-drawer__top">
            <div className="cg-drawer__heading">
              <h2 className="cg-drawer__title" id={titleId}>
                {title}
              </h2>
              {subtitle && <p className="cg-drawer__subtitle">{subtitle}</p>}
            </div>

            {badge && <span className="cg-drawer__badge">{badge}</span>}
            <Button variant="tertiary" iconStart="cancel" aria-label="Close panel" onClick={onClose} />
          </div>
        </header>

        <div className="cg-drawer__body">{children}</div>

        {footer && <footer className="cg-drawer__footer">{footer}</footer>}
      </aside>
    </>
  );
}
