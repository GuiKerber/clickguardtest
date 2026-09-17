/**
 * @clickguard/ui — the design system consumed by the Threat Monitoring
 * prototype. Import the foundations once from '@clickguard/ui/styles.css';
 * every component ships its own stylesheet.
 */

export { Icon } from './components/Icon/Icon';
export type { IconProps, IconName } from './components/Icon/Icon';

export { Button } from './components/Button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button/Button';

export { Input } from './components/Field/Input';
export type { InputProps, FieldSize } from './components/Field/Input';

export { Select } from './components/Field/Select';
export type { SelectProps, SelectOption } from './components/Field/Select';

export { MultiSelect } from './components/Field/MultiSelect';
export type { MultiSelectProps } from './components/Field/MultiSelect';

export { Menu, MenuItem, MenuLabel, MenuSeparator } from './components/Menu/Menu';
export type { MenuProps, MenuItemProps } from './components/Menu/Menu';

export { Pill } from './components/Pill/Pill';
export type { PillProps, PillTone } from './components/Pill/Pill';

export { Dot } from './components/Dot/Dot';
export type { DotProps, DotTone } from './components/Dot/Dot';

export { Gauge } from './components/Gauge/Gauge';
export type { GaugeProps } from './components/Gauge/Gauge';

export { Progress } from './components/Progress/Progress';
export type { ProgressProps, ProgressTone, ProgressLayout } from './components/Progress/Progress';

export { Sparkline } from './components/Sparkline/Sparkline';
export type { SparklineProps, SparklineTone } from './components/Sparkline/Sparkline';

export {
  Table,
  TablePanel,
  TableToolbar,
  TableFooter,
  ToolbarSpacer,
  Th,
  Td,
  CellStack,
  CellLead,
  CellActions,
  CellData,
  CellMoney,
  CellVerdict,
  CellSignal,
} from './components/Table/Table';
export type {
  TableProps,
  ThProps,
  TdProps,
  TableDensity,
  TableLayout,
  SortDirection,
  CellStackProps,
  CellMoneyProps,
  CellVerdictProps,
  CellSignalProps,
} from './components/Table/Table';

export { Section } from './components/Section/Section';
export type { SectionProps } from './components/Section/Section';

export { Drawer } from './components/Drawer/Drawer';
export type { DrawerProps } from './components/Drawer/Drawer';

export {
  Timeline,
  TimelineItem,
  TimelineCost,
  TimelineDelta,
  TimelineThreshold,
} from './components/Timeline/Timeline';
export type {
  TimelineItemProps,
  TimelineDeltaProps,
  TimelineThresholdProps,
  TimelineTone,
} from './components/Timeline/Timeline';

export { ScoreCard } from './components/ScoreCard/ScoreCard';
export type { ScoreCardProps } from './components/ScoreCard/ScoreCard';

export { SignalCard, SignalList } from './components/Signal/Signal';
export type { SignalCardProps, SignalVerdict } from './components/Signal/Signal';

export { CaseSummary } from './components/CaseSummary/CaseSummary';
export type { CaseSummaryProps } from './components/CaseSummary/CaseSummary';

export { InfoTip } from './components/Tooltip/Tooltip';
export type { InfoTipProps } from './components/Tooltip/Tooltip';

export { Callout, EmptyState, Skeleton, StatCard, StatGrid } from './components/Feedback/Feedback';
export type { CalloutProps, EmptyStateProps, StatCardProps, CalloutTone } from './components/Feedback/Feedback';
