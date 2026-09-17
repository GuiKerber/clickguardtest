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

export function hasFilledForm(visitor: Visitor) {
  return visitor.visits.some((visit) => visit.formFill);
}

/* ---- Bot probability -------------------------------------------------------
   A different question from the risk score, and worth its own column for that
   reason. Risk asks *what is this costing me and should it be stopped* — it
   rises with spend, and a cheap nuisance never reaches the top of it. This asks
   only *is there a person here*, which is answered by behaviour and is just as
   true of an address that has cost nothing.

   Four pieces of evidence, weighted by how hard each is to fake.
   -------------------------------------------------------------------------- */

export type BotBand = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

interface BotReading {
  score: number;
  band: BotBand;
  label: string;
  /** The single strongest reason, for the tooltip and the drawer. */
  reason: string;
}

const botBandLabel: Record<BotBand, string> = {
  'very-low': 'Very low',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  'very-high': 'Very high',
};

/** Median, so one outlying visit cannot carry the whole reading. */
function medianEngagement(visitor: Visitor) {
  const seconds = visitor.visits.map((visit) => visit.engagementSeconds).sort((a, b) => a - b);
  return seconds[Math.floor(seconds.length / 2)] ?? 0;
}

export function botProbabilityOf(visitor: Visitor): BotReading {
  let score = 0;
  let reason = 'Nothing in this visitor’s behaviour looks automated.';

  // 1. Timing. A fixed cadence is the hardest thing for a person to produce by
  //    accident and the easiest for a script to produce by default.
  const rhythm = rhythmOf(visitor);
  if (rhythm.kind === 'spam') {
    score += 45;
    reason = 'Clicks arrive at a near-fixed interval, far faster than a person browses.';
  } else if (rhythm.kind === 'clockwork') {
    score += 35;
    reason = 'Clicks arrive on an almost exact schedule.';
  } else if (rhythm.kind === 'bursty') {
    score += 15;
  }

  // 2. Where it comes from. A datacentre sells servers, not broadband; a
  //    verified crawler is openly a machine and says so.
  if (visitor.device === 'crawler') {
    score += 40;
    reason = 'Identifies itself as a search engine crawler.';
  } else if (visitor.device === 'server') {
    score += 25;
    if (score <= 25) reason = 'Connects from a datacentre rather than a home or mobile network.';
  }

  // 3. Time on page. Nobody reads a page in under two seconds.
  const engagement = medianEngagement(visitor);
  if (engagement <= 2) {
    score += 25;
    if (score <= 25) reason = 'Leaves within two seconds of arriving, every time.';
  } else if (engagement <= 10) {
    score += 12;
  } else if (engagement >= 60) {
    score -= 15;
    reason = 'Spends over a minute on the page — automated traffic does not linger.';
  }

  /* 4. Proof of a person. A purchase or a completed form is the one thing on
        this list a script does not produce as a side effect, so it outweighs
        the rest rather than merely subtracting from them. */
  if (hasConverted(visitor)) {
    score = Math.min(score, 10);
    reason = 'This visitor bought something. A script does not do that by accident.';
  } else if (hasFilledForm(visitor)) {
    score = Math.min(score, 25);
    reason = 'Completed a form with real details, which automated traffic rarely does.';
  }

  /* A shared address covers thousands of people, so the behaviour on it is a
     mixture and no single verdict about "the visitor" is safe. Pulled towards
     the middle rather than cleared: the automation may well be real, but it is
     not all of what is on this address. */
  if (visitor.sharedIp) score = Math.round(score * 0.6);

  score = Math.max(0, Math.min(100, score));

  const band: BotBand =
    score >= 80 ? 'very-high' : score >= 60 ? 'high' : score >= 35 ? 'medium' : score >= 15 ? 'low' : 'very-low';

  return { score, band, label: botBandLabel[band], reason };
}

export const botBandTone: Record<BotBand, 'clean' | 'suspicious' | 'malicious' | 'neutral'> = {
  'very-low': 'clean',
  low: 'clean',
  medium: 'suspicious',
  high: 'malicious',
  'very-high': 'malicious',
};

/* ---- Money over time -------------------------------------------------------
   Both curves below are derived, never authored. The figure printed on a card
   is the last point of its own series, so the number and the shape can never
   disagree — the same rule the risk-score ledger follows.
   -------------------------------------------------------------------------- */

const SERIES_POINTS = 24;

/** Cumulative paid spend, sampled evenly across the visitor's whole history. */
export function spendSeries(visitor: Visitor): number[] {
  const paid = visitor.visits.filter((visit) => isPaid(visit.source));
  if (paid.length === 0) return [];

  const start = paid[0].at;
  const end = Math.max(NOW, paid[paid.length - 1].at);
  const span = end - start || 1;

  return Array.from({ length: SERIES_POINTS }, (_, index) => {
    const at = start + (span * index) / (SERIES_POINTS - 1);
    return paid.reduce((total, visit) => (visit.at <= at ? total + visit.cost : total), 0);
  });
}

/**
 * What the exclusion has saved so far.
 *
 * There is no meter for money that was never spent, so this is a projection and
 * is treated as one: take the rate at which this address actually produced paid
 * clicks before it was blocked, and the average price of those clicks, then run
 * that forward over the time it has been excluded.
 *
 * The rate is measured across the visitor's active span — first paid click to
 * the block — rather than across its tightest burst. A click farm's 41-second
 * cadence describes one burst, not a week, and projecting the burst rate
 * forward would claim thousands of clicks that were never coming.
 */
interface Projection {
  /** Average time between paid clicks before the block. */
  interval: number;
  /** Average price of those clicks. */
  meanCost: number;
  /** Whole clicks avoided since the block. You cannot avoid a third of a click. */
  clicks: number;
}

function projectionOf(visitor: Visitor): Projection | null {
  if (!visitor.blockedAt) return null;

  const paidBefore = visitor.visits.filter(
    (visit) => isPaid(visit.source) && visit.at < visitor.blockedAt!,
  );
  if (paidBefore.length < 2) return null;

  const span = visitor.blockedAt - paidBefore[0].at;
  if (span <= 0) return null;

  const spent = paidBefore.reduce((total, visit) => total + visit.cost, 0);
  const interval = span / paidBefore.length;

  /* The projection runs for at most as long as the behaviour was observed.
     Without this, an address watched for six hours and excluded five days ago
     is credited with five days of clicks it was never seen sustaining — one
     visitor here claimed £9,190 saved against £450 actually spent, which is
     the sort of number that makes a reader distrust the other nine.

     The cap is deliberately conservative: it can never claim the block saved
     more than the address had already cost, so the figure understates rather
     than sells. */
  const projected = Math.min(NOW - visitor.blockedAt, span);

  return {
    interval,
    meanCost: spent / paidBefore.length,
    clicks: Math.floor(projected / interval),
  };
}

export function savedOf(visitor: Visitor): number {
  const projection = projectionOf(visitor);
  return projection ? projection.clicks * projection.meanCost : 0;
}

/**
 * The same projection, drawn at its own granularity: one step per click the
 * exclusion prevented. A smooth ramp would imply money saved continuously,
 * which is not what the model says — clicks arrive one at a time, and the
 * saving happens when each one does not.
 */
export function savedSeries(visitor: Visitor): number[] {
  const projection = projectionOf(visitor);
  if (!projection || projection.clicks < 1) return [];

  const elapsed = NOW - visitor.blockedAt!;

  return Array.from({ length: SERIES_POINTS }, (_, index) => {
    const at = (elapsed * index) / (SERIES_POINTS - 1);
    return Math.min(projection.clicks, Math.floor(at / projection.interval)) * projection.meanCost;
  });
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
