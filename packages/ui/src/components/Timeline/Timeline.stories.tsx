import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Timeline, TimelineCost, TimelineDelta, TimelineItem, TimelineThreshold } from './Timeline';
import { Pill } from '../Pill/Pill';

/**
 * The record of how a visitor reached its status, oldest first.
 *
 * The marker is coloured by how healthy the running total is at that point, not
 * by what the single step did — so the column reads as a journey from green to
 * red rather than as a row of unrelated verdicts.
 *
 * The money and the score change each have their own part, `TimelineCost` and
 * `TimelineDelta`, so the conventions travel with the component: the cost is
 * always secondary and fixed-width, and a rising score is always the bad
 * direction, stated by the sign before the colour repeats it.
 */
const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Journey: Story = {
  args: {
    children: (
      <>
        <TimelineItem
          tone="success"
          title={<>Google Ads<TimelineCost>$3.55</TimelineCost></>}
          meta="14 Sep, 08:12 · 41s on page"
          reason="First visit. Nothing unusual yet."
          score={<>Risk score <TimelineDelta value={4} /> · now 4 of 100</>}
        />
        <TimelineItem
          tone="warning"
          title={<>18 × Google Ads<TimelineCost>$63.90</TimelineCost></>}
          meta="14 Sep, 09:40 · over 52 min · 2s on page each"
          reason="Clicks arriving at a near-fixed interval, far faster than a person browses."
          score={<>Risk score <TimelineDelta value={58} /> · now 62 of 100</>}
        />
        <TimelineItem
          tone="danger"
          title={<>9 × Google Ads<TimelineCost>$31.95</TimelineCost></>}
          meta="15 Sep, 03:02 · over 6 min · 2s on page each"
          reason="Same device fingerprint seen on 14 other addresses today."
          score={<>Risk score <TimelineDelta value={34} /> · now 96 of 100</>}
          tag={<TimelineThreshold>This visitor was blocked</TimelineThreshold>}
        />
      </>
    ),
  },
  play: async ({ canvas }) => {
    // The blocking moment belongs to the entry that crossed the line, not to a
    // floating row of its own — so it must be inside a list item.
    const tag = canvas.getByText(/this visitor was blocked/i);
    await expect(tag.closest('li')).not.toBeNull();
  },
};

/**
 * Up is bad and down is good, which is the reverse of what a rising number
 * usually means. The sign carries the direction and the colour only repeats it,
 * so the reading survives for someone who cannot separate the two hues.
 */
export const Deltas: Story = {
  args: {
    children: (
      <>
        <TimelineItem
          tone="danger"
          title="Google Ads"
          meta="15 Sep, 03:02 · 2s on page"
          reason="Clicks arriving on an almost exact schedule."
          score={<>Risk score <TimelineDelta value={34} /> · now 96 of 100</>}
        />
        <TimelineItem
          tone="success"
          title="Organic"
          meta="16 Sep, 10:15 · 4 min on page"
          reason="Spent four minutes reading, then filled in the contact form."
          score={<>Risk score <TimelineDelta value={-15} /> · now 81 of 100</>}
        />
        <TimelineItem
          tone="neutral"
          title="Direct"
          meta="16 Sep, 18:40 · 22s on page"
          reason="Nothing here moves the reading either way."
          score={<>Risk score <TimelineDelta value={0} /> · now 81 of 100</>}
        />
      </>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    // The sign is the primary signal, so it has to be in the text.
    await expect(canvas.getByText('+34')).toBeVisible();
    await expect(canvas.getByText('−15')).toBeVisible();

    const colours = [...canvasElement.querySelectorAll('.cg-timeline__delta')].map(
      (delta) => getComputedStyle(delta).color,
    );
    // Up, down and flat are three readings, not two.
    await expect(new Set(colours).size).toBe(3);
  },
};

/**
 * Runs carry fractional weights — eighteen visits at 3.2 points each — and the
 * reader is shown whole points rather than a number no one can act on.
 */
export const FractionalDelta: Story = {
  args: {
    children: (
      <TimelineItem
        tone="warning"
        title={<>18 × Google Ads<TimelineCost>$63.90</TimelineCost></>}
        meta="14 Sep, 09:40 · over 52 min"
        score={<>Risk score <TimelineDelta value={57.6} /> · now 62 of 100</>}
      />
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('+58')).toBeVisible();
  },
};

/** One entry, no tag, no score — the smallest thing the component must hold. */
export const SingleEntry: Story = {
  args: {
    children: (
      <TimelineItem
        tone="neutral"
        title={<>Organic<Pill tone="neutral" size="sm">free</Pill></>}
        meta="16 Sep, 11:20 · 3 min on page"
      />
    ),
  },
};

/** Long reasons must wrap against the rail rather than push it out of line. */
export const LongReason: Story = {
  args: {
    children: (
      <TimelineItem
        tone="warning"
        title="Meta Ads"
        meta="16 Sep, 12:04 · 1s on page"
        reason="The connection resolves to a datacentre operated by OVH SAS (AS16276), which sells servers rather than home broadband, so a genuine shopper is unlikely to be browsing from it."
        score={<>Risk score <TimelineDelta value={12} /> · now 74 of 100</>}
      />
    ),
  },
};
