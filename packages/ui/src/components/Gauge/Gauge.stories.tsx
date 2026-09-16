import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Gauge } from './Gauge';
import { Pill } from '../Pill/Pill';

/**
 * A segmented dial, read top to bottom as label → figure → verdict.
 *
 * Colour comes from the scale, not the value: each segment keeps the colour of
 * the band it sits in, so a full dial reads as a journey from safe to fatal
 * rather than as a bar that happens to be red today. A dotted guide traced just
 * inside the segments keeps the dial legible along the stretch where nothing is
 * lit — without it, a low score reads as a broken arc rather than a low one.
 */
const meta = {
  title: 'Components/Gauge',
  component: Gauge,
  parameters: { layout: 'centered' },
  args: { label: 'Risk score', ariaLabel: 'Risk score' },
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = {
  args: { value: 12, badge: <Pill tone="clean" icon="shield-check">Clean</Pill> },
};

export const Rising: Story = {
  args: { value: 54, badge: <Pill tone="monitoring" icon="eye">Monitoring</Pill> },
};

export const Critical: Story = {
  args: { value: 96, badge: <Pill tone="blocked" icon="shield-blocked">Blocked</Pill> },
};

/** Ambiguity is shown, not smoothed over. */
export const Uncertain: Story = {
  args: { value: 63, badge: <Pill tone="warning" icon="alert-circle">Not certain</Pill> },
};

/** No verdict yet. The stack grows from the foot, so the figure does not move. */
export const WithoutBadge: Story = { args: { value: 41 } };

export const WithCaption: Story = {
  args: {
    value: 41,
    caption: 'Not blocked. An address is excluded once its score passes 85.',
  },
};

/** Both ends of the scale, where the arithmetic is easiest to get wrong. */
export const Empty: Story = { args: { value: 0 } };
export const Full: Story = { args: { value: 100 } };

/**
 * The dial is one image to assistive tech — 24 wedges and a dotted arc say
 * nothing on their own, so the whole thing carries a single spoken label.
 */
export const Accessibility: Story = {
  args: {
    value: 96,
    ariaLabel: 'Risk score 96 out of 100. Addresses are blocked at 85.',
    badge: <Pill tone="blocked" icon="shield-blocked">Blocked</Pill>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: /96 out of 100/i })).toBeVisible();
    // The figure is real text, not baked into the drawing.
    await expect(canvas.getByText('96')).toBeVisible();
  },
};
