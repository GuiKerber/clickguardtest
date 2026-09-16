import { useId, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { Button } from '../Button/Button';
import './Field.css';

export type FieldSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: FieldSize;
  label?: ReactNode;
  /** Visually hides the label but keeps it for assistive tech. */
  hideLabel?: boolean;
  optional?: boolean;
  help?: ReactNode;
  /** Presence flips the field into its error state. */
  error?: ReactNode;
  iconStart?: IconName;
  /** Renders a clear button; only shown while the field has a value. */
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', label, hideLabel, optional, help, error, iconStart, onClear, id, className, value, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const showClear = Boolean(onClear && value);

  const classes = [
    'cg-field',
    `cg-field--${size}`,
    iconStart && 'cg-field--icon-leading',
    showClear && 'cg-field--clearable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className={hideLabel ? 'sr-only' : 'cg-field__label'} htmlFor={inputId}>
          {label}
          {optional && <span className="cg-field__optional"> · optional</span>}
        </label>
      )}

      <div className="cg-field__control">
        {iconStart && (
          <span className="cg-field__icon cg-field__icon--leading">
            <Icon name={iconStart} size="sm" />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className="cg-input"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || help ? messageId : undefined}
          {...rest}
        />

        {showClear && (
          <Button
            variant="tertiary"
            size="sm"
            iconStart="cancel"
            className="cg-field__action"
            aria-label="Clear"
            onClick={onClear}
          />
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
});
