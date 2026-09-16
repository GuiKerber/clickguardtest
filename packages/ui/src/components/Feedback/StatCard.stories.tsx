import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './Feedback';

const meta = {
  title: "Components/StatCard",
  component: StatCard,
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Clicks reviewed', value: '12,430', meta: 'Last 7 days' },
};

export const Accent: Story = {
  args: { label: 'Ad spend saved', value: '$4,820', meta: 'Last 30 days', accent: true },
};
