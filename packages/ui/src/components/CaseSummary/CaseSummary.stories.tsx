import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CaseSummary } from './CaseSummary';

/**
 * The short version, for the reader who wants the answer before the evidence.
 *
 * Numbered rather than bulleted: the point is that a case was built one fact at
 * a time, and a bullet list says only that several things happen to be true.
 * The conclusion sits below a rule, so it reads as the sum rather than as one
 * more item.
 */
const meta = {
  title: 'Components/CaseSummary',
  component: CaseSummary,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'var(--space-96)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Why this visitor was blocked',
    steps: [
      '96 paid clicks over 3 days, costing $739.20',
      'Click interval: 96 clicks, one every 41s',
      'Network: OVH SAS (AS16276), datacentre',
    ],
    children: (
      <>
        Together these took the score to <strong>96</strong>, past the 85 mark. The address was
        excluded on 15 Sep, 03:02.
      </>
    ),
  },
} satisfies Meta<typeof CaseSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);

    /* The figures in the circles are positions, which the ordered list already
       conveys — spoken as well they would read as "one one". They are hidden
       from assistive tech, so they are counted in the DOM instead. */
    const indexes = canvasElement.querySelectorAll('.cg-case__index');
    await expect(indexes).toHaveLength(3);
    for (const index of indexes) await expect(index).toHaveAttribute('aria-hidden', 'true');
  },
};

/**
 * Not a landmark.
 *
 * This block reads like an aside and was written as one, which made it the
 * `complementary` landmark — the same role the detail panel carries. Two of
 * them on a page turns the panel from a place you can jump to into one of
 * several things called "complementary". The heading is what gives this block
 * its place in the outline; it needs no region of its own.
 */
export const IntroducesNoLandmark: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('complementary')).toBeNull();
    await expect(canvas.queryByRole('region')).toBeNull();
    await expect(canvas.getByRole('heading', { level: 4 })).toBeVisible();
  },
};

/** One fact is still a case, and the block must not look broken holding it. */
export const SingleStep: Story = {
  args: {
    steps: ['12 paid clicks over 1 day, costing $88.40'],
    children: (
      <>
        This alone took the score to <strong>88</strong>, past the 85 mark.
      </>
    ),
  },
};

/** Long facts wrap against the numbers rather than pushing them out of line. */
export const LongSteps: Story = {
  args: {
    steps: [
      '1,284 paid clicks over 17 days, costing $12,840.75',
      'Network: the connection resolves to a datacentre operated by OVH SAS (AS16276), which sells servers rather than home broadband',
      'Device fingerprint: identical to 14 other addresses that clicked the same campaign this week',
    ],
  },
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('.cg-case')!;
    const lefts = [...canvasElement.querySelectorAll('.cg-case__index')].map((index) =>
      Math.round(index.getBoundingClientRect().left),
    );
    // Every number starts on the same rail, whatever the fact beside it does.
    await expect(new Set(lefts).size).toBe(1);
    await expect(summary.scrollWidth).toBeLessThanOrEqual(Math.ceil(summary.clientWidth));
  },
};
