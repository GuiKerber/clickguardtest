import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  CellActions,
  CellData,
  CellLead,
  CellMoney,
  CellSignal,
  CellStack,
  CellVerdict,
  EmptyState,
  Input,
  Pill,
  Progress,
  Select,
  Table,
  TableFooter,
  TablePanel,
  TableToolbar,
  ToolbarSpacer,
  Td,
  Th,
  type SortDirection,
} from '@clickguard/ui';

import { visitors } from '../../data/visitors';
import type { Visitor } from '../../data/types';
import {
  botBandTone,
  botProbabilityOf,
  deviceMeta,
  formatMoney,
  formatRelative,
  hasConverted,
  metricsOf,
  rhythmOf,
  riskTone,
  savedOf,
  statusMeta,
} from '../../data/derive';
import { VisitorDrawer } from './VisitorDrawer';
import './threat-monitoring.css';

type SortKey = 'wasted' | 'risk' | 'bot' | 'visits' | 'paid' | 'lastSeen';

const PAGE_SIZE = 15;

/**
 * The filter offers what the Status column prints, not what the data model
 * stores. "Not certain" is not a status — it is a monitored address we have low
 * confidence about — but it is the word on the row, so it has to be the word in
 * the filter. Picking "Monitoring" therefore excludes the uncertain ones: they
 * are labelled differently, so they filter differently.
 */
type StatusFilter = 'all' | 'blocked' | 'not-certain' | 'monitoring' | 'clean';

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'not-certain', label: 'Not certain' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'clean', label: 'Clean' },
];

/** The same test the row uses to decide which pill to print. */
function isUnsure(visitor: Visitor) {
  return visitor.confidence === 'low' && visitor.status === 'monitoring';
}

function matchesStatus(visitor: Visitor, filter: StatusFilter) {
  switch (filter) {
    case 'all':
      return true;
    case 'not-certain':
      return isUnsure(visitor);
    case 'monitoring':
      return visitor.status === 'monitoring' && !isUnsure(visitor);
    default:
      return visitor.status === filter;
  }
}

const rangeOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export function ThreatMonitoring() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [range, setRange] = useState('30');
  const [sortKey, setSortKey] = useState<SortKey>('wasted');
  const [sortDirection, setSortDirection] = useState<SortDirection>('descending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = visitors.filter((visitor) => {
      if (!matchesStatus(visitor, status)) return false;
      if (!needle) return true;
      return (
        visitor.ip.includes(needle) ||
        visitor.country.toLowerCase().includes(needle) ||
        visitor.city.toLowerCase().includes(needle)
      );
    });

    const direction = sortDirection === 'ascending' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const left = metricsOf(a);
      const right = metricsOf(b);
      const value = {
        wasted: left.wasted - right.wasted,
        risk: a.riskScore - b.riskScore,
        bot: botProbabilityOf(a).score - botProbabilityOf(b).score,
        visits: left.totalVisits - right.totalVisits,
        paid: left.paidVisits - right.paidVisits,
        lastSeen: left.lastSeen - right.lastSeen,
      }[sortKey];
      return value * direction;
    });
  }, [query, status, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  // Filtering down to fewer pages must not strand the reader on an empty one.
  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [page, pageCount]);

  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const selectedIndex = pageRows.findIndex((visitor) => visitor.id === selectedId);
  const selected = selectedIndex >= 0 ? pageRows[selectedIndex] : null;

  function sort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'ascending' ? 'descending' : 'ascending'));
      return;
    }
    setSortKey(key);
    setSortDirection('descending');
  }

  function sortProps(key: SortKey) {
    return {
      sortable: true,
      sortDirection: sortKey === key ? sortDirection : undefined,
      onSort: () => sort(key),
    };
  }

  function resetFilters() {
    setQuery('');
    setStatus('all');
    setPage(0);
  }

  const filtersAreNarrowed = query !== '' || status !== 'all';
  const firstShown = rows.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastShown = Math.min(rows.length, (page + 1) * PAGE_SIZE);

  return (
    <>
      <h1 className="tm__title">Threat Monitoring</h1>

      <TablePanel>
        {/* Filters open the card they act on. They govern the whole list, so
            they belong to the object that holds it rather than floating above
            it with no visible tie to what they change. */}
        <TableToolbar>
        <Input
          grow
          label="Search visitors"
          hideLabel
          type="search"
          iconStart="search"
          placeholder="Search by IP, city or country"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          onClear={() => {
            setQuery('');
            setPage(0);
          }}
        />

        <Select
          label="Status"
          hideLabel
          options={statusOptions}
          value={status}
          onChange={(next) => {
            setStatus(next as StatusFilter);
            setPage(0);
          }}
        />

        <Select
          label="Date range"
          hideLabel
          options={rangeOptions}
          value={range}
          onChange={setRange}
        />

        {filtersAreNarrowed && (
          <Button variant="tertiary" iconStart="cancel" onClick={resetFilters}>
            Clear filters
          </Button>
        )}

        <ToolbarSpacer />

        <Button variant="secondary" iconStart="download">
          Export CSV
        </Button>
      </TableToolbar>

      {rows.length === 0 ? (
          <EmptyState
            icon="search"
            title="No visitors match these filters"
            actions={
              <Button variant="primary" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          >
            Nothing in the last {range} days matches what you asked for. Widen the status filter or
            clear the search to see the full list.
          </EmptyState>
        ) : (
          <Table>
            <colgroup>
              <col className="cg-col--grow" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--fit" />
              <col className="cg-col--icon" />
            </colgroup>

            <thead>
              <tr>
                <Th>
                  Visitor
                </Th>
                <Th>
                  Status
                </Th>
                <Th
                  {...sortProps('risk')}
                >
                  Risk
                </Th>
                {/* Next to Risk on purpose: the two answer different questions,
                    and a crawler scoring 2 for risk and high for automation is
                    the clearest way to show it. */}
                <Th {...sortProps('bot')}>Bot</Th>
                <Th {...sortProps('visits')}>
                  Visits
                </Th>
                <Th
                  {...sortProps('paid')}
                >
                  Paid clicks
                </Th>
                <Th>Click interval</Th>
                <Th>
                  Converted
                </Th>
                <Th
                  align="end"
                  {...sortProps('wasted')}
                >
                  Cost
                </Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((visitor) => (
                <VisitorRow
                  key={visitor.id}
                  visitor={visitor}
                  selected={visitor.id === selectedId}
                  onOpen={() => setSelectedId(visitor.id)}
                />
              ))}
            </tbody>
          </Table>
        )}

        <TableFooter>
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            Previous
          </Button>

          <span className="tm__count">
            {rows.length === 0
              ? 'No visitors'
              : `Showing ${firstShown}–${lastShown} of ${rows.length} visitors`}
          </span>

          <Button
            variant="secondary"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
          >
            Next
          </Button>
        </TableFooter>
      </TablePanel>

      {selected && (
        <VisitorDrawer
          visitor={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function VisitorRow({
  visitor,
  selected,
  onOpen,
}: {
  visitor: Visitor;
  selected: boolean;
  onOpen: () => void;
}) {
  const metrics = metricsOf(visitor);
  const rhythm = rhythmOf(visitor);
  const status = statusMeta[visitor.status];
  const device = deviceMeta[visitor.device];
  const converted = hasConverted(visitor);
  const saved = savedOf(visitor);
  const bot = botProbabilityOf(visitor);
  const unsure = visitor.confidence === 'low' && visitor.status === 'monitoring';

  return (
    <tr
      aria-selected={selected}
      data-clickable="true"
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <Td label="Visitor">
        {/* Where the visit came from is a marker, not a tag: icon-only pill.
            The colour identifies the origin; it is not a verdict. */}
        <CellLead icon={<Pill tone={device.tone} icon={device.icon} label={device.label} />}>
          <CellStack
            numeric
            primary={visitor.ip}
            aside={formatRelative(metrics.lastSeen)}
            meta={visitor.city + ', ' + visitor.country}
          />
        </CellLead>
      </Td>

      <Td label="Status">
        {/* One tag, never two. When we are watching an address precisely because
            we are unsure, "Not certain" is the more useful of the two things we
            could say, so it takes the slot. */}
        {unsure ? (
          <Pill tone="warning" icon="alert-circle">
            Not certain
          </Pill>
        ) : (
          <Pill tone={status.tone} icon={status.icon}>
            {status.label}
          </Pill>
        )}
      </Td>

      <Td label="Risk">
        <Progress
          layout="inline"
          value={visitor.riskScore}
          tone={riskTone(visitor.riskScore)}
          valueLabel={visitor.riskScore}
          ariaLabel={`Risk score ${visitor.riskScore}, ${visitor.riskBand}`}
        />
      </Td>

      <Td label="Bot">
        <Pill tone={botBandTone[bot.band]} size="sm">
          {bot.label}
        </Pill>
      </Td>

      <Td label="Visits">
        <CellData>{metrics.totalVisits}</CellData>
      </Td>

      <Td label="Paid clicks">
        <CellData muted={metrics.paidVisits === 0}>
          {metrics.paidVisits === 0 ? '—' : metrics.paidVisits}
        </CellData>
      </Td>

      <Td label="Click interval">
        <CellSignal tone={rhythm.tone}>{rhythm.text}</CellSignal>
      </Td>

      <Td label="Converted">
        <CellVerdict tone={converted ? 'success' : 'danger'}>
          {converted ? 'Yes' : 'No'}
        </CellVerdict>
      </Td>

      <Td label="Cost" align="end">
        <CellMoney
          value={metrics.wasted > 0 ? formatMoney(metrics.wasted) : '—'}
          note={saved > 0 ? `${formatMoney(saved)} saved` : undefined}
        />
      </Td>

      <Td label="Actions" noLabel>
        <CellActions>
          <Button
            variant="tertiary"
            size="sm"
            iconStart="eye"
            aria-label={`Open journey for ${visitor.ip}`}
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          />
        </CellActions>
      </Td>
    </tr>
  );
}
