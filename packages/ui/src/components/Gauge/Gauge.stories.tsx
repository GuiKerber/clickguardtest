import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gauge } from './Gauge';

const meta = {
  title: "Components/Gauge",
  component: Gauge,
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = {
  args: { value: 12, ariaLabel: 'Threat level', label: 'low', caption: 'Last 24 hours' },
};

export const Critical: Story = {
  args: { value: 96, ariaLabel: 'Threat level', label: 'critical', caption: 'Last 24 hours' },
};
