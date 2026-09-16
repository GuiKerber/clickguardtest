import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import { Dot, type DotTone } from '../Dot/Dot';
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

export interface CellStackProps {
  primary: ReactNode;
  /**
   * Sits beside the primary value in the quieter voice — a timestamp, a count.
   * It shares the line rather than taking one of its own, because a third line
   * would make every row in the table taller for a detail most rows ignore.
   */
  aside?: ReactNode;
  meta?: ReactNode;
  /** Aligns digits across rows. For identifiers and figures, not for prose. */
  numeric?: boolean;
}

export function CellStack({ primary, aside, meta, numeric }: CellStackProps) {
  return (
    <span className="cg-cell-stack">
      <span className="cg-cell-stack__line">
        <span className={['cg-cell-stack__primary', numeric && 'cg-cell-stack__primary--numeric'].filter(Boolean).join(' ')}>
          {primary}
        </span>
        {aside && <span className="cg-cell-stack__aside">{aside}</span>}
      </span>
      {meta && <span className="cg-cell-stack__meta">{meta}</span>}
    </span>
  );
}

export interface CellMoneyProps {
  value: ReactNode;
  /** A second figure that qualifies the first — money recovered, for instance. */
  note?: ReactNode;
  /** Colours the note. The note still has to say what it means in words. */
  noteTone?: 'success' | 'danger' | 'neutral';
}

/**
 * A figure with an optional second figure beneath it. Two lines, never three:
 * the note must not wrap away from the word that explains it.
 */
export function CellMoney({ value, note, noteTone = 'success' }: CellMoneyProps) {
  return (
    <span className="cg-cell-money">
      <span className="cg-cell-money__value">{value}</span>
      {note && <span className={`cg-cell-money__note cg-cell-money__note--${noteTone}`}>{note}</span>}
    </span>
  );
}

export interface CellVerdictProps {
  tone: 'success' | 'danger' | 'neutral';
  children: ReactNode;
}

/**
 * A one-word answer carrying a status colour. The word is the answer; the
 * colour only speeds up scanning, which is why there is no icon-less variant
 * where the colour would be alone.
 */
export function CellVerdict({ tone, children }: CellVerdictProps) {
  return <span className={`cg-cell-verdict cg-cell-verdict--${tone}`}>{children}</span>;
}

export interface CellSignalProps {
  tone?: DotTone;
  children: ReactNode;
}

/**
 * A finding written as a sentence, with a coloured marker beside it.
 *
 * Where a measurement fits in words it is written in words — "96 clicks, one
 * every 41s" — rather than drawn. A custom visualisation in a table cell buys a
 * moment of delight and costs a permanent legend.
 */
export function CellSignal({ tone = 'neutral', children }: CellSignalProps) {
  return (
    <span className="cg-cell-signal">
      <Dot tone={tone} />
      {children}
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
