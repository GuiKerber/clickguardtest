import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InfoTip } from './Tooltip';

const meta = {
  title: 'Components/InfoTip',
  component: InfoTip,
  parameters: { layout: 'centered' },
  args: {
    term: 'click fraud',
    children: "Repeated, non-genuine clicks on an ad, meant to drain the advertiser's budget.",
  },
} satisfies Meta<typeof InfoTip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Opens on hover, on focus and on click; closes on blur and on Escape.
 * A tooltip that only answers the mouse is not an explanation, it is decoration.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /what is click fraud/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('tooltip')).toBeVisible();
  },
};

/** Reachable and dismissable without a mouse. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /what is click fraud/i });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/**
 * The explanation is wired to the trigger with `aria-describedby`, so a screen
 * reader reads it as part of the control rather than as loose text nearby.
 */
export const Described: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /what is click fraud/i });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAccessibleDescription(/repeated, non-genuine clicks/i);
  },
};

/** Anchored to the end when the trigger sits near the right edge. */
export const AlignEnd: Story = {
  args: { align: 'end' },
};
