import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dot } from './Dot';

const meta = {
  title: "Components/Dot",
  component: Dot,
} satisfies Meta<typeof Dot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Success: Story = { args: { tone: 'success' } };
export const Danger: Story = { args: { tone: 'danger' } };
