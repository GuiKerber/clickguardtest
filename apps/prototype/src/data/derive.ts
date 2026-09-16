import type { IconName } from '@clickguard/ui';
import { NOW } from './visitors';
import type { RiskBand, TrafficSource, Visitor, VisitorMetrics, VisitorStatus } from './types';

export const PAID_SOURCES: TrafficSource[] = ['google-ads', 'meta-ads'];

export function isPaid(source: TrafficSource) {
  return PAID_SOURCES.includes(source);
}

export function metricsOf(visitor: Visitor): VisitorMetrics {
  const paid = visitor.visits.filter((visit) => isPaid(visit.source));

  return {
    totalVisits: visitor.visits.length,
    paidVisits: paid.length,
    wasted: paid.reduce((total, visit) => total + visit.cost, 0),
    lastSeen: Math.max(...visitor.visits.map((visit) => visit.at)),
    paidTimes: paid.map((visit) => visit.at),
  };
}

export type RhythmClass = 'spam' | 'clockwork' | 'bursty' | 'spaced' | 'unknown';

interface RhythmReading {
  kind: RhythmClass;
  /** The finding as a sentence. The colour beside it only speeds up scanning. */
  text: string;
  tone: 'danger' | 'warning' | 'neutral';
}

/**
 * Classifies the spacing between paid clicks into one word.
 *
 * Standard deviation is the wrong tool here: a click farm that fires every 41
 * seconds for an hour, pauses for two days, then fires again looks "irregular"
 * to it, because the two-day pause dominates the variance. What matters is
 * whether most gaps cluster around one value — so this measures how many gaps
 * sit within a quarter of the median.
 */
export function rhythmOf(visitor: Visitor): RhythmReading {
  const all = metricsOf(visitor).paidTimes;
  // The median is measured over the most recent stretch — an older burst does
  // not describe behaviour now — but the sentence counts every paid click, or
  // it would contradict the Paid clicks column two cells to the left.
  const times = all.slice(-60);
  const count = all.length;

  if (times.length < 4) {
    return { kind: 'unknown', text: 'Too few clicks to read', tone: 'neutral' };
  }

  const gaps = times.slice(1).map((time, index) => time - times[index]);
  const sorted = [...gaps].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const share = gaps.filter((gap) => Math.abs(gap - median) <= median * 0.25).length / gaps.length;
  const every = formatGap(median);

  // A fast, fixed cadence is the most incriminating shape there is.
  if (share >= 0.7) {
    return {
      kind: median < 2 * 60_000 ? 'spam' : 'clockwork',
      text: `${count} clicks, one every ${every}`,
      tone: 'danger',
    };
  }

  if (share >= 0.4) {
    return { kind: 'bursty', text: `${count} clicks in tight runs`, tone: 'warning' };
  }

  return { kind: 'spaced', text: `${count} clicks, uneven gaps`, tone: 'neutral' };
}

export function hasConverted(visitor: Visitor) {
  return visitor.visits.some((visit) => visit.conversion);
}

function formatGap(ms: number) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 90) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `${hours}h` : `${Math.round(hours / 24)}d`;
}

export function formatMoney(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export function formatRelative(timestamp: number) {
  const diff = NOW - timestamp;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** How long something lasted, in the coarsest unit that still reads honestly. */
export function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)} days`;
}

export function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/* ---- Display mappings ------------------------------------------------------ */

export const statusMeta: Record<VisitorStatus, { label: string; tone: 'blocked' | 'monitoring' | 'clean'; icon: IconName }> = {
  blocked: { label: 'Blocked', tone: 'blocked', icon: 'shield-blocked' },
  monitoring: { label: 'Monitoring', tone: 'monitoring', icon: 'eye' },
  clean: { label: 'Clean', tone: 'clean', icon: 'shield-check' },
};

/** The score at which an address is handed to the ad platform's exclusion list. */
export const BLOCK_THRESHOLD = 85;

/**
 * The bar's colour is tied to the blocking threshold, not to an independent
 * severity band. Red is reserved for "this address is excluded" — a score that
 * has not crossed the line has not earned it, however high it looks.
 */
export function riskTone(score: number): 'clean' | 'suspicious' | 'malicious' {
  if (score >= BLOCK_THRESHOLD) return 'malicious';
  if (score >= 45) return 'suspicious';
  return 'clean';
}

export const bandTone: Record<RiskBand, 'clean' | 'suspicious' | 'malicious'> = {
  clean: 'clean',
  suspicious: 'suspicious',
  malicious: 'malicious',
};

export const sourceMeta: Record<TrafficSource, { label: string; icon: IconName }> = {
  'google-ads': { label: 'Google Ads', icon: 'cursor' },
  'meta-ads': { label: 'Meta Ads', icon: 'cursor' },
  organic: { label: 'Organic', icon: 'search' },
  direct: { label: 'Direct', icon: 'arrow-right' },
  referral: { label: 'Referral', icon: 'external-link' },
};

/**
 * Where the visit came from. The colour identifies the origin type so the column
 * can be scanned — it is not a verdict, which is why datacentre is amber and
 * never red. Status says whether something is wrong; this only says what it is.
 */
export const deviceMeta: Record<
  Visitor['device'],
  { icon: IconName; label: string; tone: 'info' | 'success' | 'warning' | 'neutral' }
> = {
  desktop: { icon: 'computer', label: 'Desktop, home or office network', tone: 'info' },
  mobile: { icon: 'device', label: 'Mobile device', tone: 'success' },
  server: { icon: 'server', label: 'Datacentre server, not a home connection', tone: 'warning' },
  crawler: { icon: 'robot', label: 'Verified search engine crawler', tone: 'neutral' },
};
