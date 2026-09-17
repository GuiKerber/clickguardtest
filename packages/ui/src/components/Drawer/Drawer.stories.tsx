import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Drawer } from './Drawer';
import { Button } from '../Button/Button';
import { Callout, StatCard } from '../Feedback/Feedback';
import { Gauge } from '../Gauge/Gauge';
import { Pill } from '../Pill/Pill';
import { Section } from '../Section/Section';
import { Sparkline } from '../Sparkline/Sparkline';
import { Timeline, TimelineItem, TimelineThreshold } from '../Timeline/Timeline';

/**
 * The panel is non-modal on purpose: the table stays visible and clickable
 * behind it, so an analyst can move from one visitor to the next without
 * closing anything. Below the stack breakpoint the table is off-screen anyway,
 * so the panel becomes a full sheet and earns a scrim.
 *
 * The content below is the panel Threat Monitoring actually opens, built from
 * the same exported parts: the verdict on top of the money it stands for, then
 * the history, then the evidence — each of the two lower blocks foldable, so a
 * reader who has made up their mind can get the long ones out of the way.
 */
const spend = [0, 8, 15, 15, 62, 140, 210, 255, 300, 380, 470, 540, 610, 680, 739, 739, 739];
const saved = [0, 0, 7.7, 7.7, 15.4, 23.1, 23.1, 30.8, 38.5, 46.2, 53.9, 61.6, 69.3, 77, 84.6];

/* Layout scaffolding for the story, not a component: the gauge sits above a
   pair of cards. Everything drawn inside it comes from the system. */
const metrics = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' };
const block = { display: 'grid', gap: 'var(--space-4)' };

function Demo(args: Partial<React.ComponentProps<typeof Drawer>>) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open panel</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="203.0.113.47"
        subtitle="Jakarta, Indonesia · 118 visits · 96 paid"
        badge={<Pill tone="blocked" icon="shield-blocked">Blocked</Pill>}
        footer={
          <>
            <Button variant="danger" iconStart="cancel">Remove from exclusion list</Button>
            <Button variant="tertiary" iconStart="external-link">Open in Google Ads</Button>
          </>
        }
        {...args}
      >
        <div style={block}>
          {/* The verdict sits under the score that produced it, so the two are
              read as one statement rather than as a heading and a fact. */}
          <Gauge
            value={96}
            label="Risk score"
            badge={<Pill tone="blocked" icon="shield-blocked">Blocked</Pill>}
            ariaLabel="Risk score 96 out of 100. Addresses are blocked at 85."
          />

          <div style={metrics}>
            <StatCard
              label="Wasted"
              value="$739.20"
              meta="96 paid clicks"
              chart={
                <Sparkline
                  points={spend}
                  tone="danger"
                  ariaLabel="Spend on this visitor rose to $739.20 over 96 paid clicks."
                />
              }
            />
            <StatCard
              accent
              label="Saved"
              value="$84.60"
              meta="No ads shown since"
              chart={
                <Sparkline
                  points={saved}
                  tone="success"
                  ariaLabel="Projected saving since the block, reaching $84.60."
                />
              }
            />
          </div>
        </div>

        <Section title="Access history" note="The steps that led to this visitor’s status, oldest first.">
          <Timeline>
            <TimelineItem
              tone="success"
              title="Google Ads"
              meta="14 Sep, 08:12 · 41s on page"
              reason="First visit. Nothing unusual yet."
              score={<>Risk score +4 · now 4 of 100</>}
            />
            <TimelineItem
              tone="danger"
              title="18 × Google Ads"
              meta="15 Sep, 03:02 · over 52 min · 2s on page each"
              reason="Clicks arriving at a near-fixed interval, far faster than a person browses."
              score={<>Risk score +92 · now 96 of 100</>}
              tag={<TimelineThreshold>This visitor was blocked</TimelineThreshold>}
            />
          </Timeline>
        </Section>

        <Section title="Signals we measured" note="Open a signal to see what it means." defaultOpen={false}>
          <p>Signal cards go here.</p>
        </Section>
      </Drawer>
    </>
  );
}

const meta = {
  title: 'Components/Drawer',
  component: Demo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blocked: Story = {};

/** Watched rather than blocked, and the panel says why rather than implying it. */
export const Monitoring: Story = {
  args: {
    title: '198.51.100.9',
    subtitle: 'Frankfurt, Germany · 42 visits · 31 paid · shared address',
    badge: <Pill tone="warning" icon="alert-circle">Not certain</Pill>,
    children: (
      <>
        <div style={block}>
          <Gauge
            value={63}
            label="Risk score"
            badge={<Pill tone="warning" icon="alert-circle">Not certain</Pill>}
            ariaLabel="Risk score 63 out of 100. Addresses are blocked at 85."
          />
          <div style={metrics}>
            <StatCard label="Wasted" value="$188.40" meta="31 paid clicks" />
            <StatCard label="Saved" value="—" meta="Not blocked yet" />
          </div>
        </div>

        <Callout tone="warning" title="We are not certain about this one. ">
          This address belongs to a mobile network, so it can cover thousands of real people.
          Blocking it would remove genuine customers along with the suspicious activity.
        </Callout>
      </>
    ),
    footer: (
      <>
        <Button variant="primary" iconStart="shield-blocked">Block this visitor</Button>
        <Button variant="tertiary" iconStart="check-circle">Mark as trusted</Button>
      </>
    ),
  },
};

/** The exclusion is sent but not yet live, and the panel does not pretend otherwise. */
export const Syncing: Story = {
  args: {
    children: (
      <>
        <div style={block}>
          <Gauge
            value={88}
            label="Risk score"
            badge={<Pill tone="blocked" icon="shield-blocked">Blocked</Pill>}
            ariaLabel="Risk score 88 out of 100."
          />
        </div>
        <Callout tone="info">
          The exclusion has been sent to Google Ads and is waiting to be applied. Until it is, this
          visitor can still see your ads.
        </Callout>
      </>
    ),
  },
};

/** No status badge and no footer — the panel must not collapse without them. */
export const Bare: Story = {
  args: { badge: undefined, footer: undefined, subtitle: undefined, children: <p>Nothing recorded yet.</p> },
};

/** Escape closes it, and the panel takes focus when it opens. */
export const KeyboardDismiss: Story = {
  play: async ({ canvas, userEvent }) => {
    // Presence, not visibility: the panel fades in, so for the first frames of
    // the entrance animation its computed opacity is still 0 and a visibility
    // assertion would be racing the animation rather than testing the panel.
    await expect(canvas.getByRole('complementary')).toBeInTheDocument();
    await expect(document.activeElement).toHaveClass('cg-drawer');

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('complementary')).toBeNull();
  },
};

/** The close button is the only way out besides Escape, so it must be reachable. */
export const CloseButton: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /close panel/i }));
    await expect(canvas.queryByRole('complementary')).toBeNull();
  },
};

/**
 * The verdict the panel opens with is the verdict the row was showing. Two
 * places to read the same status is two places for them to disagree, so the
 * badge in the header and the badge under the dial are the same word.
 */
export const VerdictAgrees: Story = {
  play: async ({ canvas }) => {
    const badges = canvas.getAllByText('Blocked');
    await expect(badges).toHaveLength(2);
  },
};
