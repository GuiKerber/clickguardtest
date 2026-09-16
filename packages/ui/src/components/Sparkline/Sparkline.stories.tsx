import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Sparkline } from './Sparkline';

/**
 * A chart with no axes, no grid and no labels.
 *
 * It answers one question — did this climb steadily, in bursts, or not at all —
 * and deliberately cannot answer any other. The figure beside it carries the
 * magnitude; an axis here would invite the reader to measure a drawing that is
 * only 64 pixels wide.
 */
const meta = {
  title: 'Components/Sparkline',
  component: Sparkline,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--space-16)', height: 'var(--space-8)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Money spent on one visitor, climbing and then stopping at the exclusion. */
export const Spend: Story = {
  args: {
    tone: 'danger',
    points: [0, 8, 15, 15, 62, 140, 210, 255, 300, 380, 470, 540, 610, 680, 739, 739, 739, 739],
  },
};

/** Money the exclusion prevented: one step per click that never arrived. */
export const Saved: Story = {
  args: {
    tone: 'success',
    points: [0, 0, 7.7, 7.7, 15.4, 23.1, 23.1, 30.8, 38.5, 46.2, 53.9, 61.6, 69.3, 77, 84.7, 100.1],
  },
};

export const Default: Story = {
  args: { points: [4, 9, 6, 12, 8, 15, 11, 19, 14, 22] },
};

/** A visitor that cost nothing after its first click. Flat is a finding too. */
export const Flat: Story = {
  args: { points: Array.from({ length: 12 }, () => 7.7) },
};

/** Bursts, not a trend — the shape the click-farm cases actually make. */
export const Bursty: Story = {
  args: {
    tone: 'danger',
    points: [0, 0, 0, 90, 180, 180, 180, 180, 180, 420, 660, 660, 660, 660, 739],
  },
};

/** Fewer than two points is not a line. The component renders nothing rather
 *  than a dot the reader would try to interpret. */
export const NotEnoughData: Story = {
  args: { points: [12] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.cg-sparkline')).toBeNull();
  },
};

/**
 * Decorative by default. It only gains a role and a name when the chart is
 * saying something the surrounding text does not.
 */
export const Described: Story = {
  args: {
    tone: 'danger',
    points: [0, 40, 120, 260, 480, 739],
    ariaLabel: 'Spend on this visitor rose to $739.20 over 96 paid clicks.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: /rose to \$739\.20/i })).toBeVisible();
  },
};

export const Decorative: Story = {
  args: { points: [0, 40, 120, 260, 480, 739] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};
