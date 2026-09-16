import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Drawer } from './Drawer';
import { Button } from '../Button/Button';
import { Callout } from '../Feedback/Feedback';
import { Gauge } from '../Gauge/Gauge';
import { Pill } from '../Pill/Pill';
import { StatCard } from '../Feedback/Feedback';

/**
 * The panel is non-modal on purpose: the table stays visible and clickable
 * behind it, so an analyst can move from one visitor to the next without
 * closing anything. Below the stack breakpoint the table is off-screen anyway,
 * so the panel becomes a full sheet and earns a scrim.
 */
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
        <Gauge value={96} label="risk score" ariaLabel="Risk score 96 out of 100." />
        <StatCard label="Wasted" value="$341.28" meta="96 paid clicks" />
        <StatCard accent label="Saved" value="$84.60" meta="No ads shown since" />
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

export const Monitoring: Story = {
  args: {
    title: '198.51.100.9',
    subtitle: 'Frankfurt, Germany · 42 visits · 31 paid',
    badge: <Pill tone="warning" icon="alert-circle">Not certain</Pill>,
    children: (
      <Callout tone="warning" title="We are not certain about this one. ">
        This address belongs to a mobile network, so it can cover thousands of real people. Blocking
        it would remove genuine customers along with the suspicious activity.
      </Callout>
    ),
    footer: (
      <>
        <Button variant="primary" iconStart="shield-blocked">Block this visitor</Button>
        <Button variant="tertiary" iconStart="check-circle">Mark as trusted</Button>
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
