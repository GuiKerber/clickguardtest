import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Block this visitor',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Remove from exclusion list' },
};

export const Sizes: Story = {
  render: (args) => (
    <span style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <Button {...args} size="sm" />
      <Button {...args} size="md" />
      <Button {...args} size="lg" />
    </span>
  ),
  args: { variant: 'secondary' },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};

/** Label and icon, in both slots. */
export const WithIcon: Story = {
  args: { variant: 'secondary', iconStart: 'shield-check', children: 'Mark as trusted' },
};

export const IconOnly: Story = {
  args: { variant: 'tertiary', iconStart: 'more-vertical', children: undefined, 'aria-label': 'Row actions' },
  play: async ({ canvas }) => {
    // With no label, the accessible name has to come from somewhere.
    await expect(canvas.getByRole('button', { name: 'Row actions' })).toBeVisible();
  },
};

/** Loading disables the button and marks it busy while the spinner replaces the label. */
export const Loading: Story = {
  args: { variant: 'primary', loading: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

/**
 * Guards the wiring, not the colour.
 *
 * The button is compared against a probe painted with the same semantic token,
 * so this passes whenever `tokens.css` reached the preview and the variant read
 * from `--action-primary-bg` — and keeps passing when the brand is retuned.
 * Asserting a literal `rgb(...)` here would turn every palette change into a
 * broken test, which is how a design system teaches people to ignore its tests.
 */
export const TokensAreLoaded: Story = {
  args: { variant: 'primary', children: 'Approve' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /approve/i });

    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--action-primary-bg)';
    document.body.append(probe);
    const expected = getComputedStyle(probe).backgroundColor;
    probe.remove();

    // An unresolved token computes to transparent; that would make the check vacuous.
    await expect(expected).not.toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(button).backgroundColor).toBe(expected);
  },
};
