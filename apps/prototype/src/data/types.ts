export type TrafficSource = 'google-ads' | 'meta-ads' | 'organic' | 'direct' | 'referral';
export type RiskBand = 'clean' | 'suspicious' | 'malicious';
export type VisitorStatus = 'blocked' | 'monitoring' | 'clean';
export type DeviceKind = 'desktop' | 'mobile' | 'server' | 'crawler';

/** How sure the system is about its own verdict. Low confidence is shown, not hidden. */
export type Confidence = 'high' | 'medium' | 'low';

export interface Visit {
  id: string;
  at: number;
  source: TrafficSource;
  /** What this visit cost the advertiser. Zero for everything that is not a paid click. */
  cost: number;
  engagementSeconds: number;
  pagesViewed: number;
  formFill: boolean;
  conversion: boolean;
  /** What this visit added to the running score. Negative entries argue for innocence. */
  delta: number;
  reason: string;
  /** Visits that arrived after the IP was excluded from the ad platforms. */
  afterBlock: boolean;
}

export type SignalVerdict = 'incriminating' | 'exonerating' | 'neutral';

export interface Signal {
  label: string;
  value: string;
  verdict: SignalVerdict;
  /** Written for someone who does not run ad campaigns. */
  explain: string;
}

export interface Visitor {
  id: string;
  ip: string;
  city: string;
  country: string;
  device: DeviceKind;
  /** Carrier-grade NAT, corporate or campus ranges: one IP, many real people. */
  sharedIp: boolean;
  status: VisitorStatus;
  riskScore: number;
  riskBand: RiskBand;
  confidence: Confidence;
  /** The one-line answer to "why is this row here?". */
  headline: string;
  platform: string;
  blockedAt?: number;
  /** An exclusion is not live the moment we decide it — the ad platform has to accept it. */
  syncState?: 'synced' | 'syncing';
  signals: Signal[];
  visits: Visit[];
}

export interface VisitorMetrics {
  totalVisits: number;
  paidVisits: number;
  wasted: number;
  lastSeen: number;
  paidTimes: number[];
}
