import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Pill.css';

export type PillTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'clean'
  | 'monitoring'
  | 'suspicious'
  | 'malicious'
  | 'blocked';

export interface PillProps {
  tone?: PillTone;
  size?: 'sm' | 'md';
  /** Always pair a tone with an icon: colour must never carry meaning alone. */
  icon?: IconName;
  /** Omit to render an icon-only pill; `label` then carries the meaning. */
  children?: ReactNode;
  /**
   * Accessible name. Required for an icon-only pill, where nothing visible
   * says what the icon means.
   */
  label?: string;
  className?: string;
}

export function Pill({ tone = 'neutral', size = 'md', icon, children, label, className }: PillProps) {
  // An icon with no label is a marker, not a tag — it takes the full radius so
  // it never reads as a truncated word.
  const iconOnly = !children && Boolean(icon);

  const classes = [
    'cg-pill',
    `cg-pill--${tone}`,
    size === 'sm' && 'cg-pill--sm',
    iconOnly && 'cg-pill--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} title={iconOnly ? label : undefined}>
      {icon && <Icon name={icon} size="sm" label={iconOnly ? label : undefined} />}
      {children}
    </span>
  );
}
