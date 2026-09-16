import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  CellActions,
  CellData,
  CellLead,
  CellMoney,
  CellSignal,
  CellStack,
  CellVerdict,
  Table,
  TableFooter,
  TablePanel,
  TableToolbar,
  ToolbarSpacer,
  Td,
  Th,
  type SortDirection,
} from './Table';
import { Button } from '../Button/Button';
import { Dot } from '../Dot/Dot';
import { Icon } from '../Icon/Icon';
import { Input } from '../Field/Input';
import { Pill } from '../Pill/Pill';
import { Select } from '../Field/Select';
import { Progress } from '../Progress/Progress';

/* The same nine columns Threat Monitoring ships, assembled from the same parts.
   A story that shows a simpler table than the product is a story that stops
   catching the product's problems. */

const rows = [
  {
    ip: '45.132.19.204', place: 'Hanoi, Vietnam', seen: '3h ago',
    device: 'server' as const, status: 'blocked' as const,
    risk: 96, visits: 98, paid: 96, interval: '96 clicks, one every 41s', rhythm: 'danger' as const,
    converted: false, cost: 739.2, saved: 214.4,
  },
  {
    ip: '92.118.160.41', place: 'Frankfurt, Germany', seen: '7 min ago',
    device: 'desktop' as const, status: 'blocked' as const,
    risk: 91, visits: 53, paid: 49, interval: '49 clicks, one every 7m', rhythm: 'danger' as const,
    converted: false, cost: 450.8, saved: 302.1,
  },
  {
    ip: '62.210.87.116', place: 'Paris, France', seen: '12 min ago',
    device: 'server' as const, status: 'monitoring' as const,
    risk: 74, visits: 35, paid: 33, interval: '33 clicks, one every 12m', rhythm: 'danger' as const,
    converted: false, cost: 415.8, saved: 0,
  },
  {
    ip: '82.66.14.9', place: 'Lyon, France', seen: '1h ago',
    device: 'mobile' as const, status: 'monitoring' as const,
    risk: 52, visits: 19, paid: 11, interval: '11 clicks in tight runs', rhythm: 'warning' as const,
    converted: false, cost: 88.4, saved: 0,
  },
  {
    ip: '177.54.203.18', place: 'São Paulo, Brazil', seen: '26 min ago',
    device: 'mobile' as const, status: 'clean' as const,
    risk: 8, visits: 6, paid: 3, interval: '3 clicks, uneven gaps', rhythm: 'neutral' as const,
    converted: true, cost: 12.6, saved: 0,
  },
];

const deviceMeta = {
  server: { icon: 'server', tone: 'warning', label: 'Datacentre server, not a home connection' },
  desktop: { icon: 'computer', tone: 'info', label: 'Desktop, home or office network' },
  mobile: { icon: 'device', tone: 'success', label: 'Mobile device' },
} as const;

const statusMeta = {
  blocked: { label: 'Blocked', tone: 'blocked', icon: 'shield-blocked' },
  monitoring: { label: 'Monitoring', tone: 'monitoring', icon: 'eye' },
  clean: { label: 'Clean', tone: 'clean', icon: 'shield-check' },
} as const;

const statusFilter = [
  { value: 'all', label: 'All statuses' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'clean', label: 'Clean' },
];

const rangeFilter = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const riskTone = (score: number) => (score >= 85 ? 'malicious' : score >= 45 ? 'suspicious' : 'clean');
const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

type SortKey = 'risk' | 'visits' | 'paid' | 'cost';

function VisitorTable({ density }: { density?: 'compact' | 'default' | 'comfortable' }) {
  const [sortKey, setSortKey] = useState<SortKey>('risk');
  const [direction, setDirection] = useState<SortDirection>('descending');

  const sorted = [...rows].sort((a, b) => {
    const delta = a[sortKey] - b[sortKey];
    return direction === 'descending' ? -delta : delta;
  });

  const sortProps = (key: SortKey) => ({
    sortable: true,
    sortDirection: sortKey === key ? direction : undefined,
    onSort: () => {
      if (sortKey === key) setDirection((d) => (d === 'ascending' ? 'descending' : 'ascending'));
      else { setSortKey(key); setDirection('descending'); }
    },
  });

  return (
    <TablePanel>
      <TableToolbar>
        <Input
          label="Search visitors"
          hideLabel
          type="search"
          iconStart="search"
          placeholder="Search by IP, city or country"
        />
        <Select label="Status" hideLabel options={statusFilter} value="all" onChange={() => {}} />
        <Select label="Date range" hideLabel options={rangeFilter} value="30" onChange={() => {}} />
        <ToolbarSpacer />
        <Button variant="secondary" iconStart="download">Export CSV</Button>
      </TableToolbar>

      <Table density={density}>
        <thead>
          <tr>
            <Th>Visitor</Th>
            <Th>Status</Th>
            <Th {...sortProps('risk')}>Risk</Th>
            <Th {...sortProps('visits')}>Visits</Th>
            <Th {...sortProps('paid')}>Paid clicks</Th>
            <Th>Click interval</Th>
            <Th>Converted</Th>
            <Th align="end" {...sortProps('cost')}>Cost</Th>
            <Th><span className="sr-only">Actions</span></Th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((row) => {
            const device = deviceMeta[row.device];
            const status = statusMeta[row.status];

            return (
              <tr key={row.ip} data-clickable="true" tabIndex={0}>
                <Td label="Visitor">
                  <CellLead icon={<Pill tone={device.tone} icon={device.icon} label={device.label} />}>
                    <CellStack numeric primary={row.ip} aside={row.seen} meta={row.place} />
                  </CellLead>
                </Td>

                <Td label="Status">
                  <Pill tone={status.tone} icon={status.icon}>{status.label}</Pill>
                </Td>

                <Td label="Risk">
                  <Progress
                    layout="inline"
                    value={row.risk}
                    valueLabel={row.risk}
                    tone={riskTone(row.risk)}
                    ariaLabel={`Risk score ${row.risk} for ${row.ip}`}
                  />
                </Td>

                <Td label="Visits"><CellData>{row.visits}</CellData></Td>
                <Td label="Paid clicks"><CellData>{row.paid}</CellData></Td>

                <Td label="Click interval">
                  <CellSignal tone={row.rhythm}>{row.interval}</CellSignal>
                </Td>

                <Td label="Converted">
                  <CellVerdict tone={row.converted ? 'success' : 'danger'}>
                    {row.converted ? 'Yes' : 'No'}
                  </CellVerdict>
                </Td>

                <Td label="Cost" align="end">
                  <CellMoney
                    value={money(row.cost)}
                    note={row.saved > 0 ? `${money(row.saved)} saved` : undefined}
                  />
                </Td>

                <Td label="Actions" noLabel>
                  <CellActions>
                    <Button variant="tertiary" size="sm" iconStart="eye" aria-label={`Open journey for ${row.ip}`} />
                  </CellActions>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <TableFooter>
        <Button variant="secondary" disabled>Previous</Button>
        <span>Showing 5 of 35 visitors</span>
        <Button variant="secondary">Next</Button>
      </TableFooter>
    </TablePanel>
  );
}

const meta = {
  title: 'Components/Table',
  component: VisitorTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VisitorTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Threat Monitoring table, assembled only from exported parts. */
export const ThreatMonitoring: Story = {
  globals: { viewport: { value: 'wide' } },
};

export const Compact: Story = { args: { density: 'compact' }, globals: { viewport: { value: 'wide' } } };
export const Comfortable: Story = { args: { density: 'comfortable' }, globals: { viewport: { value: 'wide' } } };

/**
 * Sorting is announced through `aria-sort`, not just through a rotated chevron —
 * a screen reader has no way to see which way the arrow points.
 *
 * Pinned wide: the stacked layout has no column headers at all, so this
 * behaviour only exists above the breakpoint.
 */
export const Sorting: Story = {
  globals: { viewport: { value: 'wide' } },
  play: async ({ canvas, userEvent }) => {
    const header = canvas.getByRole('columnheader', { name: /risk/i });
    await expect(header).toHaveAttribute('aria-sort', 'descending');

    await userEvent.click(canvas.getByRole('button', { name: /risk/i }));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');

    // Sorting a second column releases the first, rather than stacking sorts.
    await userEvent.click(canvas.getByRole('button', { name: /visits/i }));
    await expect(header).not.toHaveAttribute('aria-sort');
  },
};

/**
 * Below the stack breakpoint each row becomes a labelled card, with the column
 * name carried on the cell as `data-label` and printed by CSS.
 *
 * Known limitation, asserted rather than hidden: switching the cells to
 * `display: block` strips the implicit ARIA table roles and `thead` is hidden
 * outright, so on a narrow screen the grid is no longer a table to assistive
 * technology. Restoring it needs explicit `role` attributes on the rows, which
 * the consumer writes rather than this component.
 */
export const Stacked: Story = {
  globals: { viewport: { value: 'narrow' } },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('45.132.19.204')[0]).toBeVisible();
    await expect(canvas.queryByRole('columnheader')).toBeNull();
  },
};

/** Every cell empty. Proves the row height holds without content propping it up. */
export const EmptyCells: Story = {
  render: () => (
    <TablePanel>
      <Table>
        <thead>
          <tr>
            <Th>Visitor</Th>
            <Th>Status</Th>
            <Th align="end">Cost</Th>
          </tr>
        </thead>
        <tbody>
          {[0, 1].map((i) => (
            <tr key={i}>
              <Td label="Visitor"><CellData muted>—</CellData></Td>
              <Td label="Status"><CellData muted>—</CellData></Td>
              <Td label="Cost" align="end"><CellData muted>—</CellData></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TablePanel>
  ),
};

/**
 * Long, unbroken values are the usual way a table layout breaks. Nothing here
 * may push the row wider than its scroll container.
 */
export const Overflow: Story = {
  render: () => (
    <TablePanel>
      <Table>
        <thead>
          <tr>
            <Th>Visitor</Th>
            <Th>Note</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td label="Visitor">
              <CellLead icon={<Icon name="server" size="sm" />}>
                <CellStack
                  primary="2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                  meta="Ulaanbaatar, Mongolia · OVH SAS (AS16276)"
                />
              </CellLead>
            </Td>
            <Td label="Note">
              <CellData>
                <Dot tone="danger" /> aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
              </CellData>
            </Td>
          </tr>
        </tbody>
      </Table>
    </TablePanel>
  ),
};
