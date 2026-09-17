import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Progress } from './Progress';

/**
 * The risk score, drawn.
 *
 * The number is a score out of 100, not a percentage, so nothing here prints a
 * `%` — the bar is the proportion and the figure beside it is the score. Tone
 * comes from the band the score falls in (clean under 45, suspicious to 85,
 * malicious above it), which is the same rule the Risk column uses, so a row
 * and a panel can never disagree about what a 74 looks like.
 */
const meta = {
  title: 'Components/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  // `value` is required, so the meta carries a floor for the stories that draw
  // their own bars and never read the args.
  args: { value: 0 },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Labels above a full-height bar — for cards and panels. */
export const Stacked: Story = {
  args: { value: 62, tone: 'suspicious', label: 'Risk score', valueLabel: 62 },
  play: async ({ canvas }) => {
    // Proves the numeric args actually drove the ARIA value, not just the fill width.
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
  },
};

/**
 * The number to the left of a slim bar — for table rows, where vertical space
 * is the scarce resource. With no visible label it has to carry its own name.
 */
export const Inline: Story = {
  args: {
    value: 74,
    layout: 'inline',
    tone: 'suspicious',
    valueLabel: 74,
    ariaLabel: 'Risk score 74 for 62.210.87.116',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: /risk score 74/i })).toBeVisible();
  },
};

/* ---- The three bands, in the order the table sorts them ---- */

export const Clean: Story = {
  args: { value: 8, tone: 'clean', label: 'Risk score', valueLabel: 8 },
};

export const Suspicious: Story = {
  args: { value: 52, tone: 'suspicious', label: 'Risk score', valueLabel: 52 },
};

export const Malicious: Story = {
  args: { value: 96, tone: 'malicious', label: 'Risk score', valueLabel: 96 },
};

/** The three bands side by side, as the Risk column stacks them. */
export const Bands: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-3)', maxWidth: 'var(--space-48)' }}>
      <Progress layout="inline" value={8} tone="clean" valueLabel={8} ariaLabel="Risk score 8" />
      <Progress layout="inline" value={52} tone="suspicious" valueLabel={52} ariaLabel="Risk score 52" />
      <Progress layout="inline" value={96} tone="malicious" valueLabel={96} ariaLabel="Risk score 96" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fills = [...canvasElement.querySelectorAll('.cg-progress__fill')];
    const colours = new Set(fills.map((fill) => getComputedStyle(fill).backgroundColor));
    // Three bands, three colours. Colour is never the only signal — the score
    // is printed beside every bar — but the bands must not collapse.
    await expect(colours.size).toBe(3);
  },
};

/** Both ends of the scale, where the arithmetic is easiest to get wrong. */
export const Empty: Story = {
  args: { value: 0, tone: 'clean', label: 'Risk score', valueLabel: 0 },
};

export const Full: Story = {
  args: { value: 100, tone: 'malicious', label: 'Risk score', valueLabel: 100 },
};

/** Out of range is clamped rather than drawn past the end of the track. */
export const OutOfRange: Story = {
  args: { value: 140, tone: 'malicious', label: 'Risk score', valueLabel: 100 },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    const fill = canvasElement.querySelector('.cg-progress__fill') as HTMLElement;
    await expect(fill.style.width).toBe('100%');
  },
};
