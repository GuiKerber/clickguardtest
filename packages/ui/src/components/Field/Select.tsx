import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import type { FieldSize } from './Input';
import './Field.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  size?: FieldSize;
  label?: ReactNode;
  hideLabel?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Shown while the value is empty. */
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * A listbox, not a native `<select>`.
 *
 * The native control renders the operating system's own menu — a different
 * typeface, a different highlight colour and a different corner radius on every
 * machine. That is one component the design system cannot reach, sitting in the
 * middle of a toolbar it is supposed to match.
 */
export function Select({
  size = 'md',
  label,
  hideLabel,
  help,
  error,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  id,
  className,
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const listId = `${selectId}-list`;
  const messageId = `${selectId}-message`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value)),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({
      block: 'nearest',
    });
  }, [open, activeIndex]);

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;

    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
      setOpen(true);
      return;
    }

    if (!open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  const classes = ['cg-field', `cg-field--${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <span className={hideLabel ? 'sr-only' : 'cg-field__label'} id={`${selectId}-label`}>
          {label}
        </span>
      )}

      <div className="cg-field__control cg-select-root" ref={rootRef}>
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          className="cg-select"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${selectId}-label ${selectId}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || help ? messageId : undefined}
          disabled={disabled}
          data-placeholder={!selected ? 'true' : undefined}
          onClick={() => !disabled && setOpen((current) => !current)}
          onKeyDown={onKeyDown}
        >
          {/* The trigger is sized by its widest option, not by the current one,
              so choosing a shorter label cannot make the control shrink under
              the pointer that just clicked it. The sizer holds every label at
              zero height; the widest sets the column and the visible value
              stacks on top of it. */}
          <span className="cg-select__value-box">
            <span className="cg-select__value">{selected?.label ?? placeholder}</span>
            <span className="cg-select__sizer" aria-hidden="true">
              {placeholder && <span>{placeholder}</span>}
              {options.map((option) => (
                <span key={option.value}>{option.label}</span>
              ))}
            </span>
          </span>
          <Icon name="chevron-down" size="sm" className="cg-select__chevron" />
        </button>

        {open && (
          <ul className="cg-select__list" id={listId} role="listbox" ref={listRef} tabIndex={-1}>
            {options.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  className="cg-select__option"
                  role="option"
                  aria-selected={option.value === value}
                  data-active={index === activeIndex || undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                >
                  <span>{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <span className="cg-field__error" id={messageId}>
          <Icon name="alert-circle" size="sm" />
          {error}
        </span>
      ) : (
        help && (
          <span className="cg-field__help" id={messageId}>
            {help}
          </span>
        )
      )}
    </div>
  );
}
