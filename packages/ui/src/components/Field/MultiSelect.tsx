import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import type { FieldSize } from './Input';
import type { SelectOption } from './Select';
import './Field.css';

export interface MultiSelectProps {
  size?: FieldSize;
  label?: ReactNode;
  hideLabel?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Word used in the "All <noun>" and "n <noun>" summaries. */
  summaryNoun?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * The same control as Select, for choices that are not mutually exclusive.
 * Toggling an option leaves the list open — picking three filters should not
 * cost three trips to the trigger.
 */
export function MultiSelect({
  size = 'md',
  label,
  hideLabel,
  help,
  error,
  options,
  value,
  onChange,
  placeholder = 'None',
  summaryNoun = 'selected',
  disabled,
  id,
  className,
}: MultiSelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const listId = `${selectId}-list`;
  const messageId = `${selectId}-message`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;

    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
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
        if (options[activeIndex]) toggle(options[activeIndex].value);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  const summary =
    value.length === 0
      ? placeholder
      : value.length === options.length
        ? `All ${summaryNoun}`
        : value.length === 1
          ? (options.find((option) => option.value === value[0])?.label ?? placeholder)
          : `${value.length} ${summaryNoun}`;

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
          /* Same role as Select: the two controls look and behave alike, so
             they must sound alike too. A trigger that opens a listbox is a
             combobox, whether or not the choice is exclusive. */
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${selectId}-label ${selectId}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || help ? messageId : undefined}
          disabled={disabled}
          data-placeholder={value.length === 0 ? 'true' : undefined}
          onClick={() => !disabled && setOpen((current) => !current)}
          onKeyDown={onKeyDown}
        >
          <span className="cg-select__value">{summary}</span>
          <Icon name="chevron-down" size="sm" className="cg-select__chevron" />
        </button>

        {open && (
          <ul className="cg-select__list" id={listId} role="listbox" aria-multiselectable="true">
            {options.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  className="cg-select__option"
                  role="option"
                  aria-selected={value.includes(option.value)}
                  data-active={index === activeIndex || undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggle(option.value)}
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
