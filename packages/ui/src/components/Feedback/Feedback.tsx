import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import './Feedback.css';

/* ---- Callout ---------------------------------------------------------------- */

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger';

export interface CalloutProps {
  tone?: CalloutTone;
  icon?: IconName;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

const calloutIcon: Record<CalloutTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-circle',
  danger: 'alert-circle',
};

export function Callout({ tone = 'info', icon, title, children, className }: CalloutProps) {
  return (
    <div className={['cg-callout', tone !== 'info' && `cg-callout--${tone}`, className].filter(Boolean).join(' ')}>
      <Icon name={icon ?? calloutIcon[tone]} size="sm" />
      <span>
        {title && <strong className="cg-callout__title">{title}</strong>}
        {children}
      </span>
    </div>
  );
}

/* ---- Empty state ------------------------------------------------------------ */

export interface EmptyStateProps {
  icon?: IconName;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({ icon = 'shield-check', title, children, actions }: EmptyStateProps) {
  return (
    <div className="cg-empty">
      <span className="cg-empty__icon">
        <Icon name={icon} size="lg" />
      </span>
      <h3 className="cg-empty__title">{title}</h3>
      {children && <p className="cg-empty__body">{children}</p>}
      {actions && <div className="cg-empty__actions">{actions}</div>}
    </div>
  );
}

/* ---- Skeleton ---------------------------------------------------------------- */

export function Skeleton({ width = '100%' }: { width?: string }) {
  return <span className="cg-skeleton" style={{ width }} />;
}

/* ---- Stat card ---------------------------------------------------------------- */

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  meta?: ReactNode;
  /** Lifts the number into the success tone — for money the product saved. */
  accent?: boolean;
  /**
   * Sits beside the value, at a fixed size. Meant for a sparkline: a shape that
   * says how the figure was reached, never a second figure.
   */
  chart?: ReactNode;
}

export function StatCard({ label, value, meta, accent, chart }: StatCardProps) {
  return (
    <div className={['cg-stat', accent && 'cg-stat--accent'].filter(Boolean).join(' ')}>
      <span className="cg-stat__label">{label}</span>

      {/* The figure keeps the reading edge and the chart takes what is left, so
          a longer number narrows the drawing instead of pushing it out. */}
      <span className="cg-stat__row">
        <span className="cg-stat__value">{value}</span>
        {chart && <span className="cg-stat__chart">{chart}</span>}
      </span>

      {meta && <span className="cg-stat__meta">{meta}</span>}
    </div>
  );
}
