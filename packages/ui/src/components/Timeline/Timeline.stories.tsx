import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Timeline, TimelineItem, TimelineThreshold } from './Timeline';
import { Pill } from '../Pill/Pill';

/**
 * The record of how a visitor reached its status, oldest first.
 *
 * The marker is coloured by how healthy the running total is at that point, not
 * by what the single step did — so the column reads as a journey from green to
 * red rather than as a row of unrelated verdicts.
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
          title={<>Google Ads<span> $3.55</span></>}
          meta="14 Sep, 08:12 · 41s on page"
          reason="First visit. Nothing unusual yet."
          score={<>Risk score <span>+4</span> · now 4 of 100</>}
        />
        <TimelineItem
          tone="warning"
          title={<>18 × Google Ads<span> $63.90</span></>}
          meta="14 Sep, 09:40 · over 52 min · 2s on page each"
          reason="Clicks arriving at a near-fixed interval, far faster than a person browses."
          score={<>Risk score <span>+58</span> · now 62 of 100</>}
        />
        <TimelineItem
          tone="danger"
          title={<>9 × Google Ads<span> $31.95</span></>}
          meta="15 Sep, 03:02 · over 6 min · 2s on page each"
          reason="Same device fingerprint seen on 14 other addresses today."
          score={<>Risk score <span>+34</span> · now 96 of 100</>}
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
        score={<>Risk score <span>+12</span> · now 74 of 100</>}
      />
    ),
  },
};
