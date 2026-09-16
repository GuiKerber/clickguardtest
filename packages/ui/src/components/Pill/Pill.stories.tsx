import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pill } from './Pill';

const meta = {
  title: "Components/Pill",
  component: Pill,
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clean: Story = {
  args: { tone: 'clean', icon: 'shield-check', children: 'Clean' },
};

export const Malicious: Story = {
  args: { tone: 'malicious', icon: 'alert-circle', children: 'Malicious' },
};

export const IconOnly: Story = {
  args: { tone: 'blocked', icon: 'shield-blocked', label: 'Blocked' },
};
