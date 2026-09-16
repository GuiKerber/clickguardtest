import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import './Menu.css';

export interface MenuProps {
  /** Rendered as the trigger label. Omit for an icon-only trigger. */
  label?: ReactNode;
  triggerProps?: Omit<ButtonProps, 'children' | 'onClick' | 'aria-expanded'>;
  /** Aligns the panel to the trigger's end edge. */
  align?: 'start' | 'end';
  children: ReactNode;
  className?: string;
}

/**
 * Click to toggle, Escape or an outside click to close. Focus returns to the
 * trigger on close so keyboard users never lose their place.
 */
export function Menu({ label, triggerProps, align = 'start', children, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={['cg-menu-root', className].filter(Boolean).join(' ')} ref={rootRef}>
      <Button
        ref={triggerRef}
        variant="secondary"
        size="sm"
        iconEnd={label ? 'chevron-down' : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        {...triggerProps}
      >
        {label}
      </Button>

      {open && (
        <div
          className={['cg-menu', align === 'end' && 'cg-menu--end'].filter(Boolean).join(' ')}
          role="menu"
          onClick={(event) => {
            // Checkable items keep the menu open; plain actions close it.
            const item = (event.target as HTMLElement).closest('[role="menuitem"]');
            if (item) setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <span className="cg-menu__label">{children}</span>;
}

export function MenuSeparator() {
  return <div className="cg-menu__separator" role="separator" />;
}

export interface MenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  /** Turns the item into a checkbox that keeps the menu open when toggled. */
  checked?: boolean;
  disabled?: boolean;
}

export function MenuItem({ children, onSelect, checked, disabled }: MenuItemProps) {
  const checkable = checked !== undefined;

  return (
    <button
      type="button"
      className="cg-menu__item"
      role={checkable ? 'menuitemcheckbox' : 'menuitem'}
      aria-checked={checkable ? checked : undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      {checkable && (
        <span className="cg-menu__check">{checked && <Icon name="check-circle" size="sm" />}</span>
      )}
      {children}
    </button>
  );
}
