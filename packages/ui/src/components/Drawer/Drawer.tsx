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
        <header className="cg-drawer__header">
          {/* The verdict shares the top line with the close button: it is the
              first thing to read, and it needs no heading to introduce it. */}
          <div className="cg-drawer__top">
            <span className="cg-drawer__badge">{badge}</span>
            <Button variant="tertiary" iconStart="cancel" aria-label="Close panel" onClick={onClose} />
          </div>

          <h2 className="cg-drawer__title" id={titleId}>
            {title}
          </h2>
          {subtitle && <p className="cg-drawer__subtitle">{subtitle}</p>}
        </header>

        <div className="cg-drawer__body">{children}</div>

        {footer && <footer className="cg-drawer__footer">{footer}</footer>}
      </aside>
    </>
  );
}
