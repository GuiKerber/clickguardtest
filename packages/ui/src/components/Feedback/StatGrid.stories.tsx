import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { StatCard, StatGrid } from './Feedback';
import { Sparkline } from '../Sparkline/Sparkline';

/**
 * Two figures side by side, one column on a narrow screen.
 *
 * Money in this product always comes in pairs — what a visitor cost against
 * what excluding it saved — and the pair only reads as a comparison while the
 * two share a baseline. Equal columns rather than content-sized ones, so a long
 * figure on the left cannot shrink the card on the right.
 */
const spend = [0, 8, 15, 15, 62, 140, 210, 255, 300, 380, 470, 540, 610, 680, 739, 739, 739];
const saved = [0, 0, 7.7, 7.7, 15.4, 23.1, 23.1, 30.8, 38.5, 46.2, 53.9, 61.6, 69.3, 77, 100.1];

const meta = {
  title: 'Components/StatGrid',
  component: StatGrid,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'var(--space-96)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pair: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    children: (
      <>
        <StatCard
          label="Wasted"
          value="$739.20"
          meta="96 paid clicks"
          chart={<Sparkline points={spend} tone="danger" />}
        />
        <StatCard
          accent
          label="Saved"
          value="$100.10"
          meta="No ads shown since"
          chart={<Sparkline points={saved} tone="success" />}
        />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const [left, right] = [...canvasElement.querySelectorAll('.cg-stat')];
    const width = (el: Element) => Math.round(el.getBoundingClientRect().width);
    await expect(width(left)).toBe(width(right));
    // A shared baseline is what makes the two a comparison rather than a list.
    await expect(Math.round(left.getBoundingClientRect().top)).toBe(
      Math.round(right.getBoundingClientRect().top),
    );
  },
};

/**
 * A figure long enough to break a content-sized layout. The columns hold: the
 * left card wraps its number instead of stealing width from the right one.
 */
export const LopsidedValues: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    children: (
      <>
        <StatCard
          label="Wasted"
          value="$1,284,930.75"
          meta="164,201 paid clicks"
          chart={<Sparkline points={spend} tone="danger" />}
        />
        <StatCard accent label="Saved" value="—" meta="Not blocked yet" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const [left, right] = [...canvasElement.querySelectorAll('.cg-stat')];
    const width = (el: Element) => Math.round(el.getBoundingClientRect().width);
    await expect(width(left)).toBe(width(right));
  },
};

/** Nothing to report on either side. Neither card collapses. */
export const NothingYet: Story = {
  globals: { viewport: { value: 'wide' } },
  args: {
    children: (
      <>
        <StatCard label="Wasted" value="—" meta="No paid clicks" />
        <StatCard label="Saved" value="—" meta="Not blocked yet" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const heights = [...canvasElement.querySelectorAll('.cg-stat')].map((card) =>
      Math.round(card.getBoundingClientRect().height),
    );
    await expect(new Set(heights).size).toBe(1);
  },
};

/** One column below the breakpoint: side by side there, both figures would wrap. */
export const Narrow: Story = {
  globals: { viewport: { value: 'narrow' } },
  args: {
    children: (
      <>
        <StatCard label="Wasted" value="$739.20" meta="96 paid clicks" />
        <StatCard accent label="Saved" value="$100.10" meta="No ads shown since" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const [first, second] = [...canvasElement.querySelectorAll('.cg-stat')];
    await expect(second.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      first.getBoundingClientRect().bottom,
    );
  },
};
