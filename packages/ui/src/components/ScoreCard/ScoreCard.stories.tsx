import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ScoreCard } from './ScoreCard';
import { Callout, StatCard, StatGrid } from '../Feedback/Feedback';
import { Gauge } from '../Gauge/Gauge';
import { Pill } from '../Pill/Pill';
import { Sparkline } from '../Sparkline/Sparkline';

/**
 * The block a detail panel opens with: a score and the money it stands for.
 *
 * Neither half means much alone — a risk of 96 is a number until it is priced,
 * and $739 wasted is a complaint until something explains it. The card does not
 * draw any of it; it only holds the dial and the figures in one frame so they
 * are read as one statement.
 */
const spend = [0, 8, 15, 15, 62, 140, 210, 255, 300, 380, 470, 540, 610, 680, 739, 739, 739];
const saved = [0, 0, 7.7, 7.7, 15.4, 23.1, 23.1, 30.8, 38.5, 46.2, 53.9, 61.6, 69.3, 77, 84.6];

const meta = {
  title: 'Components/ScoreCard',
  component: ScoreCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'var(--space-96)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScoreCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A blocked visitor: the verdict, and what it cost before it was stopped. */
export const Blocked: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    children: (
      <>
        <Gauge
          value={96}
          label="Risk score"
          badge={<Pill tone="blocked" icon="shield-blocked">Blocked</Pill>}
          ariaLabel="Risk score 96 out of 100. Addresses are blocked at 85."
        />
        <StatGrid>
          <StatCard
            label="Wasted"
            value="$739.20"
            meta="96 paid clicks"
            chart={<Sparkline points={spend} tone="danger" />}
          />
          <StatCard
            accent
            label="Saved"
            value="$84.60"
            meta="No ads shown since"
            chart={<Sparkline points={saved} tone="success" />}
          />
        </StatGrid>
      </>
    ),
  },
};

/**
 * The caveat sits under the card, not inside it. It qualifies the verdict —
 * a shared address can hide thousands of real people behind one number — so it
 * must not read as one more fact the dial is made of.
 */
export const WithCaveat: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    aside: (
      <Callout tone="warning" title="We are not certain about this one. ">
        This address belongs to a mobile network, so it can cover thousands of real people. Blocking
        it would remove genuine customers along with the suspicious activity.
      </Callout>
    ),
    children: (
      <>
        <Gauge
          value={63}
          label="Risk score"
          badge={<Pill tone="warning" icon="alert-circle">Not certain</Pill>}
          ariaLabel="Risk score 63 out of 100."
        />
        <StatGrid>
          <StatCard label="Wasted" value="$188.40" meta="31 paid clicks" />
          <StatCard label="Saved" value="—" meta="Not blocked yet" />
        </StatGrid>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-score__card')!;
    const callout = canvasElement.querySelector('.cg-callout')!;
    // Outside the frame, below it.
    await expect(card.contains(callout)).toBe(false);
    await expect(callout.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      card.getBoundingClientRect().bottom,
    );
  },
};

/** Nothing spent yet. The pair holds its shape rather than going ragged. */
export const NothingSpent: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    children: (
      <>
        <Gauge value={12} label="Risk score" badge={<Pill tone="clean" icon="shield-check">Clean</Pill>} ariaLabel="Risk score 12 out of 100." />
        <StatGrid>
          <StatCard label="Wasted" value="—" meta="No paid clicks" />
          <StatCard label="Saved" value="—" meta="Not blocked yet" />
        </StatGrid>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const cards = [...canvasElement.querySelectorAll('.cg-stat')];
    const heights = cards.map((card) => Math.round(card.getBoundingClientRect().height));
    await expect(new Set(heights).size).toBe(1);
  },
};

/** The dial alone, for a visitor with no money attached to it yet. */
export const ScoreOnly: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    children: <Gauge value={41} label="Risk score" ariaLabel="Risk score 41 out of 100." />,
  },
};

/**
 * Below the stack breakpoint the pair becomes one column: side by side at that
 * width, both figures would wrap mid-number.
 */
export const Narrow: Story = {
  globals: { viewport: { value: 'narrow' } },
  args: {
    children: (
      <>
        <Gauge value={96} label="Risk score" badge={<Pill tone="blocked" icon="shield-blocked">Blocked</Pill>} ariaLabel="Risk score 96 out of 100." />
        <StatGrid>
          <StatCard label="Wasted" value="$739.20" meta="96 paid clicks" />
          <StatCard accent label="Saved" value="$84.60" meta="No ads shown since" />
        </StatGrid>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const [first, second] = [...canvasElement.querySelectorAll('.cg-stat')];
    // Stacked, not side by side.
    await expect(second.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      first.getBoundingClientRect().bottom,
    );
  },
};
