import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label. */
  iconStart?: IconName;
  /** Icon rendered after the label. */
  iconEnd?: IconName;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    iconStart,
    iconEnd,
    loading = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const iconSize = size === 'lg' ? 'md' : 'sm';
  const classes = ['cg-btn', `cg-btn--${variant}`, `cg-btn--${size}`, !children && 'cg-btn--icon', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="cg-btn__content">
        {iconStart && <Icon name={iconStart} size={iconSize} />}
        {children}
        {iconEnd && <Icon name={iconEnd} size={iconSize} />}
      </span>
      {loading && (
        <span className="cg-btn__loader">
          <Icon name="loading" size={iconSize} spin />
        </span>
      )}
    </button>
  );
});
