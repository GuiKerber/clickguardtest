import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Progress } from './Progress';

const meta = {
  title: "Components/Progress",
  component: Progress,
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stacked: Story = {
  args: { value: 62, label: 'Threat score', valueLabel: '62%' },
  play: async ({ canvas }) => {
    // Proves the numeric args actually drove the ARIA value, not just the fill width.
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
  },
};

export const Inline: Story = {
  args: { value: 30, layout: 'inline', valueLabel: '30%', ariaLabel: 'Suspicious clicks' },
};

export const Malicious: Story = {
  args: { value: 91, tone: 'malicious', label: 'Risk', valueLabel: '91%' },
};
