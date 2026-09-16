import type { Signal, TrafficSource, Visit, Visitor } from './types';

/** Fixed clock so the demo reads the same on every load. */
export const NOW = new Date('2026-09-16T14:30:00Z').getTime();

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Deterministic pseudo-random, so "realistic" never means "different every reload". */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

interface VisitSpec {
  /** Milliseconds before NOW. */
  ago: number;
  source: TrafficSource;
  cost?: number;
  engagementSeconds: number;
  pagesViewed: number;
  formFill?: boolean;
  conversion?: boolean;
  delta: number;
  reason: string;
  afterBlock?: boolean;
}

function buildVisits(specs: VisitSpec[]): Visit[] {
  return specs
    .map((spec, index) => ({
      id: `v${index}`,
      at: NOW - spec.ago,
      source: spec.source,
      cost: spec.cost ?? 0,
      engagementSeconds: spec.engagementSeconds,
      pagesViewed: spec.pagesViewed,
      formFill: spec.formFill ?? false,
      conversion: spec.conversion ?? false,
      delta: spec.delta,
      reason: spec.reason,
      afterBlock: spec.afterBlock ?? false,
    }))
    .sort((a, b) => a.at - b.at);
}

/**
 * Generates the filler visits behind a long journey. Hand-writing 118 rows adds
 * nothing; the shape of the pattern is what has to be right.
 */
function machineGunVisits(options: {
  count: number;
  startAgo: number;
  intervalMs: number;
  jitterMs: number;
  cost: number;
  source: TrafficSource;
  seed: number;
  reason: string;
  delta: number;
}): VisitSpec[] {
  const random = makeRandom(options.seed);
  return Array.from({ length: options.count }, (_, index) => ({
    ago: options.startAgo - index * options.intervalMs - Math.round((random() - 0.5) * options.jitterMs),
    source: options.source,
    cost: options.cost,
    engagementSeconds: Math.round(random() * 2),
    pagesViewed: 1,
    delta: options.delta,
    reason: options.reason,
  }));
}

/* ==========================================================================
   The six hand-built cases. Everything the brief asks to see lives here:
   a flagrant pattern, a genuinely ambiguous one, a shared IP, a converted
   visitor, mixed paid and organic journeys, and a visitor nobody blocked.
   ========================================================================== */

const clickFarmSignals: Signal[] = [
  {
    label: 'Device fingerprint',
    value: 'Same device seen on 14 other IPs today',
    verdict: 'incriminating',
    explain:
      'Every browser has a recognisable combination of screen size, fonts and system version. The same combination arriving from 14 different addresses is one machine changing disguise.',
  },
  {
    label: 'Network type',
    value: 'Datacentre — OVH SAS (AS16276)',
    verdict: 'incriminating',
    explain:
      'This address belongs to a company that rents servers, not to a home or mobile provider. Real customers browse from home connections.',
  },
  {
    label: 'Browser environment',
    value: 'Automation framework detected',
    verdict: 'incriminating',
    explain:
      'The browser reports features that only appear when a script is driving it instead of a person.',
  },
  {
    label: 'Click rhythm',
    value: 'Every 41s, ±3s across 96 clicks',
    verdict: 'incriminating',
    explain:
      'People click at uneven intervals. Clicks spaced almost identically apart are a timer, not a person.',
  },
  {
    label: 'Engagement',
    value: '0–2s on page, 1 page per visit',
    verdict: 'incriminating',
    explain: 'Nobody reads a landing page in two seconds. This visitor never stayed.',
  },
  {
    label: 'Conversion',
    value: 'None in 96 paid clicks',
    verdict: 'incriminating',
    explain: 'Real interest eventually produces a form, a call or a purchase. This produced nothing.',
  },
];

const clickFarm: Visitor = {
  id: 'vis-1',
  ip: '45.132.19.204',
  city: 'Hanoi',
  country: 'Vietnam',
  device: 'server',
  sharedIp: false,
  status: 'blocked',
  riskScore: 96,
  riskBand: 'malicious',
  confidence: 'high',
  headline: '96 paid clicks in 6 days, none longer than 2 seconds',
  platform: 'Meta Ads',
  blockedAt: NOW - 18 * HOUR,
  syncState: 'synced',
  signals: clickFarmSignals,
  visits: buildVisits([
    {
      ago: 6 * DAY,
      source: 'meta-ads',
      cost: 7.7,
      engagementSeconds: 1,
      pagesViewed: 1,
      delta: 8,
      reason: 'First paid click. Address belongs to a datacentre, not a home connection.',
    },
    {
      ago: 6 * DAY - 41_000,
      source: 'meta-ads',
      cost: 7.7,
      engagementSeconds: 0,
      pagesViewed: 1,
      delta: 14,
      reason: 'Second click 41 seconds after the first, with no time spent on the page.',
    },
    ...machineGunVisits({
      count: 60,
      startAgo: 6 * DAY - 82_000,
      intervalMs: 41_000,
      jitterMs: 6_000,
      cost: 7.7,
      source: 'meta-ads',
      seed: 7,
      delta: 0.5,
      reason: 'Another click on the same 41-second cadence.',
    }),
    {
      ago: 2 * DAY,
      source: 'meta-ads',
      cost: 7.7,
      engagementSeconds: 0,
      pagesViewed: 1,
      delta: 22,
      reason: 'Browser reported automation features. This is a script, not a person.',
    },
    ...machineGunVisits({
      count: 32,
      startAgo: 2 * DAY - 41_000,
      intervalMs: 41_000,
      jitterMs: 5_000,
      cost: 7.7,
      source: 'meta-ads',
      seed: 11,
      delta: 0.25,
      reason: 'Another click on the same 41-second cadence.',
    }),
    {
      ago: 18 * HOUR + MINUTE,
      source: 'meta-ads',
      cost: 7.7,
      engagementSeconds: 0,
      pagesViewed: 1,
      delta: 14,
      reason: 'Same device fingerprint appeared on a 14th address. The running total crossed the line here.',
    },
    {
      ago: 9 * HOUR,
      source: 'direct',
      engagementSeconds: 1,
      pagesViewed: 1,
      delta: 0,
      reason: 'Typed the URL directly. No ad shown, no cost.',
      afterBlock: true,
    },
    {
      ago: 3 * HOUR,
      source: 'direct',
      engagementSeconds: 0,
      pagesViewed: 1,
      delta: 0,
      reason: 'Typed the URL directly. No ad shown, no cost.',
      afterBlock: true,
    },
  ]),
};

const vpnRotator: Visitor = {
  id: 'vis-2',
  ip: '89.187.162.44',
  city: 'Amsterdam',
  country: 'Netherlands',
  device: 'desktop',
  sharedIp: false,
  status: 'blocked',
  riskScore: 92,
  riskBand: 'malicious',
  confidence: 'high',
  headline: '41 paid clicks from a VPN, always within office hours of one competitor',
  platform: 'Google Ads',
  blockedAt: NOW - 2 * DAY,
  syncState: 'synced',
  signals: [
    {
      label: 'Network type',
      value: 'Commercial VPN exit — M247 (AS9009)',
      verdict: 'incriminating',
      explain:
        'The address belongs to a VPN provider, which hides where the visitor really is. Legitimate buyers rarely need that.',
    },
    {
      label: 'Device fingerprint',
      value: 'Same device seen on 6 other VPN addresses',
      verdict: 'incriminating',
      explain: 'One machine reappearing behind several VPN exits is deliberately avoiding an address block.',
    },
    {
      label: 'Time of day',
      value: '38 of 41 clicks on weekdays, 09:00–18:00 CET',
      verdict: 'incriminating',
      explain: 'Traffic that only happens during business hours in one timezone looks like a job, not a customer.',
    },
    {
      label: 'Click ID',
      value: '3 clicks reused the same Google click ID',
      verdict: 'incriminating',
      explain:
        'Google stamps a unique code on every paid click. The same code arriving repeatedly means the visit was forged — and you can check this yourself in Google Ads.',
    },
    {
      label: 'Engagement',
      value: 'Median 4s, never scrolled past the fold',
      verdict: 'incriminating',
      explain: 'The visitor left before the page finished being read.',
    },
    {
      label: 'Conversion',
      value: 'None',
      verdict: 'incriminating',
      explain: 'No form, no call, no purchase across 41 paid clicks.',
    },
  ],
  visits: buildVisits([
    { ago: 11 * DAY, source: 'organic', engagementSeconds: 96, pagesViewed: 4, delta: 0, reason: 'Arrived from an unpaid search result and read four pages. Nothing suspicious yet.' },
    { ago: 10 * DAY, source: 'google-ads', cost: 7.6, engagementSeconds: 6, pagesViewed: 1, delta: 6, reason: 'First paid click. Address belongs to a commercial VPN.' },
    ...machineGunVisits({ count: 18, startAgo: 9 * DAY, intervalMs: 5 * HOUR, jitterMs: 40 * MINUTE, cost: 7.6, source: 'google-ads', seed: 23, delta: 1, reason: 'Repeat paid click within working hours, under 8 seconds on page.' }),
    { ago: 5 * DAY, source: 'google-ads', cost: 7.6, engagementSeconds: 3, pagesViewed: 1, delta: 18, reason: 'Same device fingerprint appeared behind a different VPN address.' },
    ...machineGunVisits({ count: 19, startAgo: 4 * DAY, intervalMs: 3 * HOUR, jitterMs: 30 * MINUTE, cost: 7.6, source: 'google-ads', seed: 31, delta: 1, reason: 'Repeat paid click within working hours, under 8 seconds on page.' }),
    { ago: 2 * DAY + HOUR, source: 'google-ads', cost: 7.6, engagementSeconds: 2, pagesViewed: 1, delta: 31, reason: 'Third visit reusing a Google click ID already counted. The running total crossed the line here.' },
    { ago: 20 * HOUR, source: 'organic', engagementSeconds: 12, pagesViewed: 1, delta: 0, reason: 'Came back through unpaid search. No ad shown, no cost.', afterBlock: true },
  ]),
};

const ambiguous: Visitor = {
  id: 'vis-3',
  ip: '188.214.106.72',
  city: 'Bucharest',
  country: 'Romania',
  device: 'desktop',
  sharedIp: false,
  status: 'monitoring',
  riskScore: 54,
  riskBand: 'suspicious',
  confidence: 'low',
  headline: 'Six paid clicks with almost no engagement — but it filled in a form',
  platform: 'Google Ads',
  signals: [
    {
      label: 'Form fill',
      value: 'Submitted a quote request on 12 Sep',
      verdict: 'exonerating',
      explain:
        'Somebody typed real details into your form. Automated traffic almost never does this, and it is the strongest argument that this is a person.',
    },
    {
      label: 'Click rhythm',
      value: 'Irregular — 4 min to 3 days apart',
      verdict: 'exonerating',
      explain: 'Uneven gaps between clicks are what people look like. A script would be far more regular.',
    },
    {
      label: 'Network type',
      value: 'Residential — RCS & RDS (AS8708)',
      verdict: 'exonerating',
      explain: 'This is a home internet connection, not a rented server.',
    },
    {
      label: 'Engagement',
      value: 'Median 9s across 6 paid clicks',
      verdict: 'incriminating',
      explain: 'Short visits. Not zero, but well under what a genuine reader spends.',
    },
    {
      label: 'Geographic signals',
      value: 'Address says Romania, browser language is en-GB',
      verdict: 'neutral',
      explain:
        'The address and the browser tell slightly different stories. On its own this proves nothing — plenty of real people travel or change their language.',
    },
    {
      label: 'Conversion',
      value: 'No purchase yet',
      verdict: 'neutral',
      explain: 'The form was filled but nothing was bought. Too early to say either way.',
    },
  ],
  visits: buildVisits([
    { ago: 9 * DAY, source: 'google-ads', cost: 15.2, engagementSeconds: 11, pagesViewed: 2, delta: 10, reason: 'First paid click. Short visit, but two pages viewed.' },
    { ago: 9 * DAY - 4 * MINUTE, source: 'google-ads', cost: 15.2, engagementSeconds: 6, pagesViewed: 1, delta: 18, reason: 'Clicked the same ad again four minutes later.' },
    { ago: 7 * DAY, source: 'organic', engagementSeconds: 140, pagesViewed: 5, delta: -6, reason: 'Returned through unpaid search and read five pages. This argues against fraud.' },
    { ago: 4 * DAY, source: 'google-ads', cost: 15.2, engagementSeconds: 8, pagesViewed: 1, delta: 14, reason: 'Paid click with almost no time on page.' },
    { ago: 4 * DAY - 9 * MINUTE, source: 'google-ads', cost: 15.2, engagementSeconds: 5, pagesViewed: 1, delta: 16, reason: 'Second paid click in under ten minutes.' },
    { ago: 4 * DAY - 22 * MINUTE, source: 'google-ads', cost: 15.2, engagementSeconds: 240, pagesViewed: 3, formFill: true, delta: -14, reason: 'Filled in the quote request form with real details. Automated traffic does not do this.' },
    { ago: 30 * HOUR, source: 'google-ads', cost: 14.85, engagementSeconds: 7, pagesViewed: 1, delta: 16, reason: 'Back to short paid visits. Pattern is unresolved.' },
  ]),
};

const sharedCarrier: Visitor = {
  id: 'vis-4',
  ip: '172.58.231.9',
  city: 'Dallas',
  country: 'United States',
  device: 'mobile',
  sharedIp: true,
  status: 'monitoring',
  riskScore: 61,
  riskBand: 'suspicious',
  confidence: 'low',
  headline: 'Mobile carrier address — this number may cover thousands of real people',
  platform: 'Google Ads',
  signals: [
    {
      label: 'Shared address',
      value: 'T-Mobile US carrier NAT (AS21928)',
      verdict: 'exonerating',
      explain:
        'Mobile networks put thousands of phones behind one address. Blocking it would silently remove real customers, so we hold back even when the score is high.',
    },
    {
      label: 'Device fingerprint',
      value: '11 distinct devices behind this address',
      verdict: 'neutral',
      explain:
        'Many different devices on one address is normal for a mobile network. It is only suspicious when the same device hops between addresses.',
    },
    {
      label: 'Conversion',
      value: '1 purchase on 09 Sep — $340',
      verdict: 'exonerating',
      explain: 'Somebody behind this address actually bought something. That is as real as traffic gets.',
    },
    {
      label: 'Engagement',
      value: 'Mixed: 3s to 6 min',
      verdict: 'neutral',
      explain: 'Both very short and very long visits, which is what a shared address looks like.',
    },
  ],
  visits: buildVisits([
    { ago: 12 * DAY, source: 'google-ads', cost: 3.2, engagementSeconds: 320, pagesViewed: 6, delta: 8, reason: 'Long, engaged paid visit. Nothing suspicious.' },
    { ago: 11 * DAY, source: 'google-ads', cost: 3.2, engagementSeconds: 410, pagesViewed: 4, conversion: true, delta: -8, reason: 'Purchased $340 of product. This address has produced real revenue.' },
    { ago: 8 * DAY, source: 'google-ads', cost: 3.4, engagementSeconds: 4, pagesViewed: 1, delta: 18, reason: 'A short, disengaged click — but possibly a different person on the same carrier.' },
    ...machineGunVisits({ count: 6, startAgo: 6 * DAY, intervalMs: 14 * HOUR, jitterMs: 4 * HOUR, cost: 3.3, source: 'google-ads', seed: 41, delta: 8, reason: 'Short paid visit from the shared carrier address.' }),
    { ago: 2 * DAY, source: 'referral', engagementSeconds: 78, pagesViewed: 3, delta: 0, reason: 'Arrived from a partner site. No ad shown, no cost.' },
    { ago: 5 * HOUR, source: 'organic', engagementSeconds: 52, pagesViewed: 2, delta: -5, reason: 'Unpaid search visit from the same address, five minutes of reading. No cost.' },
  ]),
};

const loyalCustomer: Visitor = {
  id: 'vis-5',
  ip: '201.45.8.17',
  city: 'São Paulo',
  country: 'Brazil',
  device: 'desktop',
  sharedIp: false,
  status: 'clean',
  riskScore: 8,
  riskBand: 'clean',
  confidence: 'high',
  headline: 'Researched over two weeks, then bought',
  platform: 'Google Ads',
  signals: [
    { label: 'Conversion', value: '1 purchase on 14 Sep — $1,180', verdict: 'exonerating', explain: 'Real money changed hands.' },
    { label: 'Engagement', value: 'Median 3m 20s across 9 visits', verdict: 'exonerating', explain: 'This visitor read the pages properly.' },
    { label: 'Network type', value: 'Residential — Vivo (AS27699)', verdict: 'exonerating', explain: 'A normal home internet connection.' },
    { label: 'Click rhythm', value: 'Irregular — hours to days apart', verdict: 'exonerating', explain: 'The uneven spacing people naturally produce.' },
  ],
  visits: buildVisits([
    { ago: 15 * DAY, source: 'organic', engagementSeconds: 210, pagesViewed: 4, delta: 0, reason: 'Found you through unpaid search.' },
    { ago: 13 * DAY, source: 'google-ads', cost: 6.2, engagementSeconds: 260, pagesViewed: 5, delta: 8, reason: 'Paid click, read five pages.' },
    { ago: 9 * DAY, source: 'direct', engagementSeconds: 180, pagesViewed: 3, delta: 0, reason: 'Came back by typing the address. Knows who you are.' },
    { ago: 6 * DAY, source: 'referral', engagementSeconds: 140, pagesViewed: 2, delta: 0, reason: 'Arrived from a review site.' },
    { ago: 2 * DAY, source: 'google-ads', cost: 6.2, engagementSeconds: 640, pagesViewed: 8, formFill: true, conversion: true, delta: 0, reason: 'Filled the form and purchased $1,180.' },
  ]),
};

const crawler: Visitor = {
  id: 'vis-6',
  ip: '66.249.66.1',
  city: 'Mountain View',
  country: 'United States',
  device: 'crawler',
  sharedIp: false,
  status: 'clean',
  riskScore: 2,
  riskBand: 'clean',
  confidence: 'high',
  headline: 'Verified search engine crawler — costs nothing, blocks nothing',
  platform: '—',
  signals: [
    {
      label: 'Identity',
      value: 'Googlebot, verified by reverse DNS',
      verdict: 'exonerating',
      explain:
        'This is Google reading your site so it can rank it. It is automated, but it never clicks paid ads and blocking it would hurt your search results.',
    },
    { label: 'Paid clicks', value: 'None, ever', verdict: 'exonerating', explain: 'It has never cost you a cent.' },
  ],
  visits: buildVisits([
    { ago: 5 * DAY, source: 'direct', engagementSeconds: 2, pagesViewed: 12, delta: 2, reason: 'Crawled 12 pages. No ad involved.' },
    { ago: 3 * DAY, source: 'direct', engagementSeconds: 2, pagesViewed: 9, delta: 0, reason: 'Crawled 9 pages. No ad involved.' },
    { ago: 5 * HOUR, source: 'direct', engagementSeconds: 1, pagesViewed: 14, delta: 0, reason: 'Crawled 14 pages. No ad involved.' },
  ]),
};

/* ==========================================================================
   The rest of the table. Filtering only means something when there is enough
   volume behind it, so these fill the list without pretending to be stories.
   ========================================================================== */

interface FillerSpec {
  ip: string;
  city: string;
  country: string;
  device: Visitor['device'];
  status: Visitor['status'];
  score: number;
  visits: number;
  paid: number;
  costPer: number;
  intervalHours: number;
  headline: string;
  platform: string;
  sharedIp?: boolean;
  blockedAgoHours?: number;
  syncState?: Visitor['syncState'];
  network: string;
  converted?: boolean;
}

const fillerSpecs: FillerSpec[] = [
  { ip: '103.152.220.18', city: 'Jakarta', country: 'Indonesia', device: 'server', status: 'blocked', score: 89, visits: 64, paid: 58, costPer: 4.1, intervalHours: 0.05, headline: '58 paid clicks at a fixed 3-minute interval', platform: 'Google Ads', blockedAgoHours: 40, syncState: 'synced', network: 'Datacentre — DigitalOcean (AS14061)' },
  { ip: '5.188.62.140', city: 'Moscow', country: 'Russia', device: 'server', status: 'blocked', score: 94, visits: 77, paid: 71, costPer: 5.8, intervalHours: 0.08, headline: 'Automation framework detected on every one of 71 paid clicks', platform: 'Google Ads', blockedAgoHours: 6, syncState: 'syncing', network: 'Datacentre — Selectel (AS49505)' },
  { ip: '154.16.105.77', city: 'Lagos', country: 'Nigeria', device: 'desktop', status: 'monitoring', score: 57, visits: 41, paid: 38, costPer: 3.4, intervalHours: 0.3, headline: 'Device fingerprint seen on 9 addresses in one afternoon', platform: 'Meta Ads', network: 'Proxy — residential proxy pool' },
  { ip: '92.118.160.41', city: 'Frankfurt', country: 'Germany', device: 'server', status: 'blocked', score: 91, visits: 53, paid: 49, costPer: 9.2, intervalHours: 0.12, headline: 'Datacentre address, zero engagement across 49 paid clicks', platform: 'Google Ads', blockedAgoHours: 120, syncState: 'synced', network: 'Datacentre — Hetzner (AS24940)' },
  { ip: '190.2.148.63', city: 'Buenos Aires', country: 'Argentina', device: 'desktop', status: 'monitoring', score: 67, visits: 19, paid: 14, costPer: 4.7, intervalHours: 4, headline: 'Clicks cluster in tight bursts, then go quiet for days', platform: 'Google Ads', network: 'Residential — Telecom Argentina (AS7303)' },
  { ip: '41.210.14.92', city: 'Nairobi', country: 'Kenya', device: 'mobile', status: 'monitoring', score: 58, visits: 11, paid: 9, costPer: 2.3, intervalHours: 9, headline: 'Short visits, but a residential mobile network', platform: 'Meta Ads', sharedIp: true, network: 'Mobile carrier NAT — Safaricom (AS33771)' },
  { ip: '213.55.99.180', city: 'Warsaw', country: 'Poland', device: 'desktop', status: 'monitoring', score: 52, visits: 8, paid: 7, costPer: 11.4, intervalHours: 14, headline: 'Repeat clicks on one expensive keyword, no engagement', platform: 'Google Ads', network: 'Residential — Orange Polska (AS5617)' },
  { ip: '77.111.245.30', city: 'Tel Aviv', country: 'Israel', device: 'desktop', status: 'monitoring', score: 63, visits: 22, paid: 16, costPer: 8.1, intervalHours: 6, headline: 'Corporate network, clicks only on weekday mornings', platform: 'Google Ads', sharedIp: true, network: 'Corporate range — Partner Communications' },
  { ip: '186.233.70.15', city: 'Lima', country: 'Peru', device: 'mobile', status: 'clean', score: 22, visits: 6, paid: 3, costPer: 2.9, intervalHours: 30, headline: 'Mixed paid and organic, reads several pages each time', platform: 'Google Ads', network: 'Mobile carrier — Claro Peru (AS12252)' },
  { ip: '84.17.52.201', city: 'Lisbon', country: 'Portugal', device: 'desktop', status: 'clean', score: 14, visits: 9, paid: 4, costPer: 5.5, intervalHours: 40, headline: 'Long research sessions, mostly unpaid traffic', platform: 'Google Ads', network: 'Residential — NOS (AS2860)' },
  { ip: '131.196.244.7', city: 'Bogotá', country: 'Colombia', device: 'desktop', status: 'clean', score: 11, visits: 5, paid: 2, costPer: 4.2, intervalHours: 52, headline: 'Two paid clicks, three unpaid returns', platform: 'Meta Ads', network: 'Residential — ETB (AS3816)' },
  { ip: '203.113.29.88', city: 'Bangkok', country: 'Thailand', device: 'mobile', status: 'clean', score: 19, visits: 7, paid: 3, costPer: 1.9, intervalHours: 26, headline: 'Normal mobile browsing pattern', platform: 'Meta Ads', sharedIp: true, network: 'Mobile carrier NAT — AIS (AS45430)' },
  { ip: '62.210.87.116', city: 'Paris', country: 'France', device: 'server', status: 'monitoring', score: 74, visits: 35, paid: 33, costPer: 12.6, intervalHours: 0.2, headline: 'Datacentre address hitting your most expensive keyword', platform: 'Google Ads', network: 'Datacentre — Scaleway (AS12876)' },
  { ip: '175.45.176.22', city: 'Manila', country: 'Philippines', device: 'desktop', status: 'monitoring', score: 71, visits: 27, paid: 24, costPer: 3.8, intervalHours: 1.5, headline: 'Regular 90-minute click cadence for four days', platform: 'Meta Ads', network: 'Residential — PLDT (AS9299)' },
  { ip: '37.120.146.9', city: 'Vienna', country: 'Austria', device: 'desktop', status: 'monitoring', score: 56, visits: 13, paid: 11, costPer: 7.3, intervalHours: 11, headline: 'VPN exit node, but engagement looks human', platform: 'Google Ads', network: 'Commercial VPN — M247 (AS9009)' },
  { ip: '156.146.51.163', city: 'Madrid', country: 'Spain', device: 'desktop', status: 'clean', score: 27, visits: 10, paid: 5, costPer: 6.4, intervalHours: 33, headline: 'VPN user who reads the whole page', platform: 'Google Ads', network: 'Commercial VPN — Private Internet Access' },
  { ip: '102.129.145.60', city: 'Cairo', country: 'Egypt', device: 'mobile', status: 'monitoring', score: 60, visits: 16, paid: 13, costPer: 2.1, intervalHours: 7, headline: 'Short visits from a shared mobile network', platform: 'Meta Ads', sharedIp: true, network: 'Mobile carrier NAT — Vodafone Egypt' },
  { ip: '45.83.220.14', city: 'Bucharest', country: 'Romania', device: 'server', status: 'monitoring', score: 66, visits: 48, paid: 46, costPer: 6.7, intervalHours: 0.1, headline: 'Clicks every 6 minutes, around the clock, for three days', platform: 'Google Ads', network: 'Datacentre — M247 (AS9009)' },
  { ip: '82.145.210.7', city: 'Dublin', country: 'Ireland', device: 'desktop', status: 'clean', score: 18, visits: 15, paid: 9, costPer: 24.5, intervalHours: 36, headline: 'Nine clicks on your most expensive keyword, every one engaged', platform: 'Google Ads', converted: true, network: 'Residential — Eir (AS5466)' },
  { ip: '143.92.60.201', city: 'Toronto', country: 'Canada', device: 'desktop', status: 'clean', score: 23, visits: 12, paid: 7, costPer: 18.9, intervalHours: 41, headline: 'Long research sessions across three weeks', platform: 'Google Ads', network: 'Residential — Rogers (AS812)' },
  { ip: '24.16.88.203', city: 'Seattle', country: 'United States', device: 'desktop', status: 'clean', score: 12, visits: 10, paid: 6, costPer: 21.4, intervalHours: 47, headline: 'Compared prices for a week, then bought', platform: 'Google Ads', converted: true, network: 'Residential — Comcast (AS7922)' },
  { ip: '46.101.128.45', city: 'Amsterdam', country: 'Netherlands', device: 'server', status: 'monitoring', score: 79, visits: 29, paid: 27, costPer: 7.4, intervalHours: 0.6, headline: 'Fixed cadence from a rented server, close to the line', platform: 'Google Ads', network: 'Datacentre — DigitalOcean (AS14061)' },
  { ip: '109.74.202.88', city: 'Sofia', country: 'Bulgaria', device: 'server', status: 'monitoring', score: 76, visits: 33, paid: 31, costPer: 6.3, intervalHours: 0.4, headline: 'Datacentre address, no engagement, not yet blocked', platform: 'Meta Ads', network: 'Datacentre — SuperHosting (AS49581)' },
  { ip: '197.210.55.140', city: 'Abuja', country: 'Nigeria', device: 'mobile', status: 'monitoring', score: 55, visits: 21, paid: 18, costPer: 1.8, intervalHours: 5, headline: 'Shared mobile network, engagement is mixed', platform: 'Meta Ads', sharedIp: true, network: 'Mobile carrier NAT — MTN Nigeria (AS29465)' },
  { ip: '59.153.102.30', city: 'Dhaka', country: 'Bangladesh', device: 'mobile', status: 'monitoring', score: 51, visits: 17, paid: 15, costPer: 1.2, intervalHours: 8, headline: 'High volume, very short visits', platform: 'Meta Ads', sharedIp: true, network: 'Mobile carrier NAT — Grameenphone (AS24389)' },
  { ip: '88.99.240.11', city: 'Helsinki', country: 'Finland', device: 'desktop', status: 'monitoring', score: 47, visits: 14, paid: 12, costPer: 5.9, intervalHours: 3, headline: 'Repeat clicks, short visits, but a home connection', platform: 'Google Ads', network: 'Residential — Elisa (AS719)' },
  { ip: '200.89.76.12', city: 'Santiago', country: 'Chile', device: 'desktop', status: 'clean', score: 9, visits: 13, paid: 4, costPer: 5.1, intervalHours: 55, headline: 'Bought twice in three weeks', platform: 'Meta Ads', converted: true, network: 'Residential — VTR (AS22047)' },
  { ip: '121.200.17.64', city: 'Ho Chi Minh City', country: 'Vietnam', device: 'mobile', status: 'clean', score: 21, visits: 6, paid: 2, costPer: 2.4, intervalHours: 44, headline: 'Two paid clicks, both read to the end', platform: 'Meta Ads', network: 'Mobile carrier — Viettel (AS7552)' },
  { ip: '91.132.139.18', city: 'Zurich', country: 'Switzerland', device: 'desktop', status: 'clean', score: 6, visits: 4, paid: 1, costPer: 14.2, intervalHours: 70, headline: 'One expensive click that converted', platform: 'Google Ads', converted: true, network: 'Residential — Swisscom (AS3303)' },
];

function buildFiller(spec: FillerSpec, index: number): Visitor {
  const random = makeRandom(1000 + index * 17);
  const band = spec.score >= 80 ? 'malicious' : spec.score >= 45 ? 'suspicious' : 'clean';
  const engaged = band === 'clean';

  const intervalMs = spec.intervalHours * HOUR;
  // Jitter has to scale with the interval, or a 3-minute cadence plus 20
  // minutes of noise stops looking like a cadence at all. Anything under two
  // hours is a machine cadence and stays tight; everything slower is a person
  // and gets enough spread that the rhythm column reads "irregular".
  const jitterMs = intervalMs * (spec.intervalHours < 2 ? 0.08 : 0.9);

  const lastPaidIndex = spec.paid - 1;

  /* An exclusion is the end of the paid series, not a label on top of it. Once
     the address is on the platform's list it is never shown another ad, so paid
     clicks run up to the block and stop there. Unpaid arrivals carry on: what
     was removed is the advertising, not the person. Anchoring both to `now`
     instead — as this generator first did — produced blocked addresses whose
     every paid click landed after the block. */
  const blockedAgo = spec.blockedAgoHours ? spec.blockedAgoHours * HOUR : 0;
  const unpaidCount = spec.visits - spec.paid;
  const unpaidWindow = blockedAgo > 0 ? blockedAgo : unpaidCount * intervalMs;

  function agoFor(index: number) {
    if (index < spec.paid) {
      const fromEnd = spec.paid - index;
      return Math.round(blockedAgo + fromEnd * intervalMs + (random() - 0.5) * jitterMs);
    }

    // Spread evenly across whatever window follows the last paid click.
    const step = index - spec.paid + 1;
    return Math.round((unpaidWindow * (unpaidCount - step + 1)) / (unpaidCount + 1));
  }

  const specs: VisitSpec[] = Array.from({ length: spec.visits }, (_, i) => {
    const isPaid = i < spec.paid;
    const source: TrafficSource = isPaid
      ? spec.platform === 'Meta Ads'
        ? 'meta-ads'
        : 'google-ads'
      : ['organic', 'direct', 'referral'][i % 3] as TrafficSource;

    return {
      ago: agoFor(i),
      source,
      cost: isPaid ? spec.costPer : 0,
      engagementSeconds: engaged ? Math.round(60 + random() * 300) : Math.round(random() * 12),
      pagesViewed: engaged ? 2 + Math.round(random() * 5) : 1,
      // The ledger has to reconcile: the deltas add up to the score on the row.
      delta: isPaid && spec.paid > 0 ? spec.score / spec.paid : 0,
      conversion: spec.converted && i === lastPaidIndex,
      reason: isPaid
        ? engaged
          ? 'Paid click with a normal, engaged visit.'
          : 'Paid click with little or no time on the page.'
        : 'Unpaid arrival. No ad shown, no cost.',
      afterBlock: !isPaid && spec.status === 'blocked',
    };
  });

  return {
    id: `fill-${index}`,
    ip: spec.ip,
    city: spec.city,
    country: spec.country,
    device: spec.device,
    sharedIp: spec.sharedIp ?? false,
    status: spec.status,
    riskScore: spec.score,
    riskBand: band,
    confidence: spec.sharedIp ? 'low' : band === 'suspicious' ? 'medium' : 'high',
    headline: spec.headline,
    platform: spec.platform,
    blockedAt: spec.blockedAgoHours ? NOW - spec.blockedAgoHours * HOUR : undefined,
    syncState: spec.syncState,
    signals: [
      {
        label: 'Network type',
        value: spec.network,
        verdict: /Datacentre|Proxy/.test(spec.network) ? 'incriminating' : 'neutral',
        explain:
          'Where this address lives. Home and mobile networks belong to real people; rented servers and proxy pools usually do not.',
      },
      {
        label: 'Engagement',
        value: engaged ? 'Median over 1 minute' : 'Median under 12 seconds',
        verdict: engaged ? 'exonerating' : 'incriminating',
        explain: 'How long the visitor stayed. Genuine interest takes time.',
      },
      {
        label: 'Click rhythm',
        value:
          spec.intervalHours < 1
            ? `Every ${Math.round(spec.intervalHours * 60)} minutes, almost exactly`
            : 'Irregular gaps between clicks',
        verdict: spec.intervalHours < 1 ? 'incriminating' : 'exonerating',
        explain: 'People click at uneven intervals. Near-identical gaps mean a timer is driving it.',
      },
      {
        label: 'Conversion',
        value: engaged ? 'None yet, but the visits look real' : 'None',
        verdict: engaged ? 'neutral' : 'incriminating',
        explain: 'Whether this visitor ever produced a form, a call or a purchase.',
      },
    ],
    visits: buildVisits(specs),
  };
}

export const visitors: Visitor[] = [
  clickFarm,
  vpnRotator,
  ambiguous,
  sharedCarrier,
  loyalCustomer,
  crawler,
  ...fillerSpecs.map(buildFiller),
];
