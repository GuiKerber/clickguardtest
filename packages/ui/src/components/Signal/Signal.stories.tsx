import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { SignalCard, SignalList } from './Signal';

/**
 * One piece of evidence, with its explanation one click away.
 *
 * The finding is always visible; the reasoning is not. Someone who already
 * trusts the verdict should not have to read six paragraphs, and someone who
 * does not should not have to call support to get them.
 *
 * The verdict is carried three ways — the word beside the chevron, the edge
 * colour, and the sentence inside — because "this counts against you" is the
 * kind of claim a reader is entitled to see stated rather than infer from a
 * red stripe.
 */
const meta = {
  title: 'Components/SignalCard',
  component: SignalCard,
  parameters: { layout: 'padded' },
  args: {
    label: 'Click interval',
    value: '96 clicks, one every 41s',
    verdict: 'incriminating',
    children: (
      <p>
        A person browsing does not return on a timer. Clicks arriving at an almost fixed spacing
        are the signature of a script, not of someone comparing prices.
      </p>
    ),
  },
} satisfies Meta<typeof SignalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Incriminating: Story = {};

export const Exonerating: Story = {
  args: {
    label: 'Time on page',
    value: '3 min 12s median',
    verdict: 'exonerating',
    children: <p>Automated traffic does not linger. Over a minute on the page points to a person.</p>,
  },
};

export const Inconclusive: Story = {
  args: {
    label: 'Browser',
    value: 'Chrome 129 on Windows',
    verdict: 'neutral',
    children: <p>The commonest browser there is. It neither helps nor hurts this address.</p>,
  },
};

/** Open on arrival, for the reader who came for the reasoning. */
export const Open: Story = { args: { defaultOpen: true } };

/**
 * Opening is a real disclosure, not a style change: the explanation is absent
 * from the document until it is asked for, and the control says so.
 */
export const Toggling: Story = {
  play: async ({ canvas, userEvent }) => {
    const head = canvas.getByRole('button');
    await expect(head).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/does not return on a timer/i)).toBeNull();

    await userEvent.click(head);
    await expect(head).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/does not return on a timer/i)).toBeVisible();
    // The effect on the score is stated, not left for the colour to imply.
    await expect(canvas.getByText(/pushed the risk score up/i)).toBeVisible();

    await userEvent.click(head);
    await expect(head).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Operable from the keyboard, because the header is a real button. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const head = canvas.getByRole('button');
    await userEvent.tab();
    await expect(head).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(head).toHaveAttribute('aria-expanded', 'true');
  },
};

/** The three verdicts together, as the panel stacks them. */
export const Evidence: Story = {
  render: () => (
    <SignalList>
      <SignalCard label="Click interval" value="96 clicks, one every 41s" verdict="incriminating">
        <p>A person browsing does not return on a timer.</p>
      </SignalCard>
      <SignalCard label="Network" value="OVH SAS (AS16276), datacentre" verdict="incriminating">
        <p>This provider sells servers, not home broadband. Shoppers do not browse from one.</p>
      </SignalCard>
      <SignalCard label="Time on page" value="41s median" verdict="exonerating">
        <p>Long enough to have read something, which automated traffic rarely does.</p>
      </SignalCard>
      <SignalCard label="Browser" value="Chrome 129 on Windows" verdict="neutral">
        <p>The commonest browser there is.</p>
      </SignalCard>
    </SignalList>
  ),
  play: async ({ canvasElement }) => {
    const edges = [...canvasElement.querySelectorAll('.cg-signal')].map(
      (card) => getComputedStyle(card).borderInlineStartColor,
    );
    // Three verdicts, three edge colours — the two incriminating cards share one.
    await expect(new Set(edges).size).toBe(3);
  },
};

/** A long value wraps inside the card rather than pushing the verdict out. */
export const LongValue: Story = {
  args: {
    label: 'Device fingerprint',
    value: '2001:0db8:85a3:0000:0000:8a2e:0370:7334 — seen on 14 other addresses today',
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-signal')!;
    const verdict = canvasElement.querySelector('.cg-signal__verdict')!;
    await expect(verdict.getBoundingClientRect().right).toBeLessThanOrEqual(
      Math.ceil(card.getBoundingClientRect().right),
    );
  },
};
