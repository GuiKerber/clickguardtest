import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { StatCard } from './Feedback';
import { Sparkline } from '../Sparkline/Sparkline';

const spend = [0, 8, 15, 15, 62, 140, 210, 255, 300, 380, 470, 540, 610, 680, 739, 739, 739];
const saved = [0, 0, 7.7, 7.7, 15.4, 23.1, 23.1, 30.8, 38.5, 46.2, 53.9, 61.6, 69.3, 77, 100.1];

const meta = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  /* Narrower than the drawer actually gives a card, on purpose: if the layout
     holds here it holds there, and the long-value story below has something
     real to push against. */
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--space-48)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Wasted', value: '$739.20', meta: '96 paid clicks' },
};

/** Accent lifts the figure into the success tone — for money the product saved. */
export const Accent: Story = {
  args: { label: 'Saved', value: '$100.10', meta: 'No ads shown since', accent: true },
};

/**
 * With a chart. The figure keeps the reading edge and the drawing takes what is
 * left, so the card answers "how much" before it answers "how did it get there".
 */
export const WithChart: Story = {
  args: {
    label: 'Wasted',
    value: '$739.20',
    meta: '96 paid clicks',
    chart: <Sparkline points={spend} tone="danger" />,
  },
};

export const AccentWithChart: Story = {
  args: {
    label: 'Saved',
    value: '$100.10',
    meta: 'No ads shown since',
    accent: true,
    chart: <Sparkline points={saved} tone="success" />,
  },
};

/** Nothing to report. The card holds its height so a pair cannot go ragged. */
export const NoValue: Story = {
  args: { label: 'Saved', value: '—', meta: 'Not blocked yet' },
};

/**
 * A long figure narrows the chart rather than pushing it out of the card —
 * the aside gives way to the answer, never the other way round.
 */
export const LongValue: Story = {
  args: {
    label: 'Wasted',
    value: '$1,284,930.75',
    meta: '164,201 paid clicks',
    chart: <Sparkline points={spend} tone="danger" />,
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-stat')!;
    const value = canvasElement.querySelector('.cg-stat__value')!;
    // Whatever the chart does, the number stays inside the card.
    await expect(value.getBoundingClientRect().right).toBeLessThanOrEqual(
      card.getBoundingClientRect().right,
    );
  },
};
