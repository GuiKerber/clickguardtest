import { useMemo } from 'react';
import {
  Button,
  Callout,
  Drawer,
  Gauge,
  Pill,
  ScoreCard,
  Section,
  SignalCard,
  SignalList,
  Sparkline,
  StatCard,
  StatGrid,
  Timeline,
  TimelineCost,
  TimelineDelta,
  TimelineItem,
  TimelineThreshold,
  type TimelineTone,
} from '@clickguard/ui';

import type { Visit, Visitor } from '../../data/types';
import { BlockSummary } from './BlockSummary';
import {
  BLOCK_THRESHOLD,
  formatDateTime,
  formatDuration,
  formatMoney,
  isPaid,
  metricsOf,
  riskTone,
  savedOf,
  savedSeries,
  sourceMeta,
  spendSeries,
  statusMeta,
} from '../../data/derive';

interface Entry {
  key: string;
  visits: Visit[];
  delta: number;
  cost: number;
  running: number;
  crossedHere: boolean;
}

/**
 * Collapses consecutive visits that share a reason. A 118-row journey is not
 * evidence, it is a wall — the shape of the pattern is what has to survive.
 */
function buildLedger(visitor: Visitor): Entry[] {
  const entries: Entry[] = [];
  let running = 0;
  let crossed = false;

  for (const visit of visitor.visits) {
    const previous = entries[entries.length - 1];
    const sameRun =
      previous &&
      previous.visits[0].reason === visit.reason &&
      previous.visits[0].afterBlock === visit.afterBlock;

    if (sameRun) {
      previous.visits.push(visit);
      previous.delta += visit.delta;
      previous.cost += visit.cost;
    } else {
      entries.push({ key: visit.id, visits: [visit], delta: visit.delta, cost: visit.cost, running: 0, crossedHere: false });
    }

    running = Math.max(0, Math.min(100, running + visit.delta));
    entries[entries.length - 1].running = running;

    if (!crossed && visitor.status === 'blocked' && running >= BLOCK_THRESHOLD) {
      entries[entries.length - 1].crossedHere = true;
      crossed = true;
    }
  }

  return entries;
}

/** Green while the journey looks normal, amber as it climbs, red past the line. */
function healthTone(running: number): TimelineTone {
  const tone = riskTone(running);
  return tone === 'malicious' ? 'danger' : tone === 'suspicious' ? 'warning' : 'success';
}

/** Runs of repeated visits carry fractional weights; the reader sees whole points. */
function ScoreLine({ delta, running }: { delta: number; running: number }) {
  const total = `${Math.round(running)} of 100`;

  if (Math.round(delta) === 0) return <>Risk score unchanged · {total}</>;

  return (
    <>
      Risk score <TimelineDelta value={delta} /> · now {total}
    </>
  );
}

export interface VisitorDrawerProps {
  visitor: Visitor;
  onClose: () => void;
}

export function VisitorDrawer({ visitor, onClose }: VisitorDrawerProps) {
  const metrics = useMemo(() => metricsOf(visitor), [visitor]);
  const ledger = useMemo(() => buildLedger(visitor), [visitor]);
  const spend = useMemo(() => spendSeries(visitor), [visitor]);
  const savedCurve = useMemo(() => savedSeries(visitor), [visitor]);
  const saved = savedOf(visitor);
  const status = statusMeta[visitor.status];
  const unsure = visitor.confidence === 'low' && visitor.status === 'monitoring';

  return (
    <Drawer
      open
      onClose={onClose}
      title={visitor.ip}
      subtitle={
        <>
          {visitor.city}, {visitor.country} · {metrics.totalVisits} visits · {metrics.paidVisits} paid
          {visitor.sharedIp && ' · shared address'}
        </>
      }
      footer={
        visitor.status === 'blocked' ? (
          <>
            <Button variant="danger" iconStart="cancel">
              Remove from exclusion list
            </Button>
            <Button variant="tertiary" iconStart="external-link">
              Open in {visitor.platform}
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" iconStart="shield-blocked">
              Block this visitor
            </Button>
            <Button variant="tertiary" iconStart="check-circle">
              Mark as trusted
            </Button>
          </>
        )
      }
    >
      {/* ---- 1. Where this visitor stands ---- */}
      <ScoreCard
        aside={
          <>
            {unsure && (
              <Callout tone="warning" title="We are not certain about this one. ">
                {visitor.sharedIp
                  ? 'This address belongs to a mobile or corporate network, so it can cover thousands of real people. Blocking it would remove genuine customers along with the suspicious activity, which is why we are watching instead of blocking.'
                  : 'The evidence points both ways: the behaviour looks automated, but this visitor has also done things automated traffic does not do. We are watching rather than blocking.'}
              </Callout>
            )}

            {visitor.syncState === 'syncing' && (
              <Callout tone="info">
                The exclusion has been sent to {visitor.platform} and is waiting to be applied. Until
                it is, this visitor can still see your ads.
              </Callout>
            )}
          </>
        }
      >
        {/* The verdict sits under the score that produced it, so the two are
            read as one statement rather than as a heading and a fact. */}
        <Gauge
          value={visitor.riskScore}
          label="Risk score"
          badge={
            unsure ? (
              <Pill tone="warning" icon="alert-circle">
                Not certain
              </Pill>
            ) : (
              <Pill tone={status.tone} icon={status.icon}>
                {status.label}
              </Pill>
            )
          }
          ariaLabel={`Risk score ${visitor.riskScore} out of 100. Addresses are blocked at ${BLOCK_THRESHOLD}.`}
        />

        <StatGrid>
          <StatCard
            label="Wasted"
            value={formatMoney(metrics.wasted)}
            meta={`${metrics.paidVisits} paid clicks`}
            chart={
              <Sparkline
                points={spend}
                tone="danger"
                ariaLabel={`Spend on this visitor rose to ${formatMoney(metrics.wasted)} over ${metrics.paidVisits} paid clicks.`}
              />
            }
          />
          <StatCard
            accent={saved > 0}
            label="Saved"
            value={saved > 0 ? formatMoney(saved) : '—'}
            meta={saved > 0 ? 'No ads shown since' : 'Not blocked yet'}
            chart={
              savedCurve.length > 0 ? (
                <Sparkline
                  points={savedCurve}
                  tone="success"
                  ariaLabel={`Projected saving since the block, reaching ${formatMoney(saved)}.`}
                />
              ) : undefined
            }
          />
        </StatGrid>
      </ScoreCard>

      {/* ---- 2. The raw evidence ----
          Before the ledger, because it answers the question the reader arrived
          with. The history explains how the score was reached; the signals
          explain why it is the right score, and someone who disagrees with the
          verdict wants the second one first. */}
      <Section
        title="Signals we measured"
        note="Open a signal to see what it means and how it moved the score."
      >
        <SignalList>
          {visitor.signals.map((signal) => (
            <SignalCard
              key={signal.label}
              label={signal.label}
              value={signal.value}
              verdict={signal.verdict}
            >
              <p>{signal.explain}</p>
            </SignalCard>
          ))}
        </SignalList>
      </Section>

      {/* ---- 3. Access history ---- */}
      <Section
        title="Access history"
        note="The steps that led to this visitor’s status, oldest first."
      >
        {visitor.status === 'blocked' && <BlockSummary visitor={visitor} />}

        <Timeline>
          {ledger.map((entry) => {
            const first = entry.visits[0];
            const count = entry.visits.length;
            const source = sourceMeta[first.source];
            const paid = isPaid(first.source);

            return (
              <TimelineItem
                key={entry.key}
                tone={healthTone(entry.running)}
                title={
                  <>
                    {count > 1 ? `${count} × ${source.label}` : source.label}
                    {paid ? (
                      <TimelineCost>{formatMoney(entry.cost)}</TimelineCost>
                    ) : (
                      <Pill tone="neutral" size="sm">
                        free
                      </Pill>
                    )}
                  </>
                }
                /* Always a date and a duration. A bare time range next to one
                   visit's engagement read as neither. */
                meta={
                  <>
                    {formatDateTime(first.at)}
                    {' · '}
                    {count > 1
                      ? `over ${formatDuration(entry.visits[count - 1].at - first.at)} · ${first.engagementSeconds}s on page each`
                      : `${first.engagementSeconds}s on page`}
                    {first.conversion && ' · converted'}
                    {first.formFill && ' · filled a form'}
                  </>
                }
                reason={first.reason}
                score={<ScoreLine delta={entry.delta} running={entry.running} />}
                tag={
                  entry.crossedHere ? (
                    <TimelineThreshold>This visitor was blocked</TimelineThreshold>
                  ) : undefined
                }
              />
            );
          })}
        </Timeline>
      </Section>
    </Drawer>
  );
}
