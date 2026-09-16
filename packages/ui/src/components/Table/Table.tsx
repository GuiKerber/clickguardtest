import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import './Table.css';

export type TableDensity = 'compact' | 'default' | 'comfortable';
export type SortDirection = 'ascending' | 'descending';
export type CellAlign = 'start' | 'end';

/* ---- Shell ---------------------------------------------------------------- */

export function TablePanel({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['cg-table-panel', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function TableToolbar({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['cg-table-toolbar', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function ToolbarSpacer() {
  return <span className="cg-table-toolbar__spacer" />;
}

export function TableFooter({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['cg-table-footer', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

/* ---- Table ---------------------------------------------------------------- */

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
  /** Collapses each row into a labelled card below the stack breakpoint. */
  stack?: boolean;
  children: ReactNode;
}

export function Table({ density = 'default', stack = true, children, className, ...rest }: TableProps) {
  const classes = [
    'cg-table',
    density !== 'default' && `cg-table--${density}`,
    stack && 'cg-table--stack',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="cg-table-scroll">
      <table className={classes} {...rest}>
        {children}
      </table>
    </div>
  );
}

/* ---- Cells ---------------------------------------------------------------- */

export interface ThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick' | 'align'> {
  align?: CellAlign;
  /** Renders the header as a sort control. */
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  children: ReactNode;
}

export function Th({ align = 'start', sortable, sortDirection, onSort, children, ...rest }: ThProps) {
  return (
    <th
      scope="col"
      data-align={align}
      aria-sort={sortDirection}
      {...rest}
    >
      {sortable ? (
        <button type="button" className="cg-table__sort" onClick={onSort}>
          {children}
          {/* Always a direction, never an ambiguous glyph: down means the next
              click sorts descending. Hidden until hover unless this column is
              the one actually sorting. */}
          <Icon name={sortDirection === 'ascending' ? 'chevron-up' : 'chevron-down'} size="sm" />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TdProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: CellAlign;
  /** Column name repeated when the row collapses into a card. */
  label?: string;
  /** Opts out of the stacked label for columns whose name adds nothing. */
  noLabel?: boolean;
  children?: ReactNode;
}

export function Td({ align = 'start', label, noLabel, children, ...rest }: TdProps) {
  return (
    <td data-align={align} data-label={label} data-no-label={noLabel || undefined} {...rest}>
      {children}
    </td>
  );
}

/* ---- Row modules ----------------------------------------------------------- */

export function CellStack({ primary, meta }: { primary: ReactNode; meta?: ReactNode }) {
  return (
    <span className="cg-cell-stack">
      <span className="cg-cell-stack__primary">{primary}</span>
      {meta && <span className="cg-cell-stack__meta">{meta}</span>}
    </span>
  );
}

export function CellLead({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="cg-cell-lead">
      {icon && <span className="cg-cell-lead__icon">{icon}</span>}
      {children}
    </span>
  );
}

export function CellActions({ children }: { children: ReactNode }) {
  return <span className="cg-cell-actions">{children}</span>;
}

export function CellData({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <span className={['cg-cell-data', muted && 'cg-cell-muted'].filter(Boolean).join(' ')}>{children}</span>;
}
