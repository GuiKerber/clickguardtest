import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Dot } from './Dot';

/**
 * A status bullet, five tones deep.
 *
 * It never carries meaning alone: every dot in this product sits beside the
 * sentence it colours, so the reading survives without the hue. The tones come
 * from the `--dot-*` layer rather than from the status icons, because an 8px
 * circle needs a stronger colour than a 16px glyph to reach 3:1 against the
 * row it sits on.
 */
const meta = {
  title: 'Components/Dot',
  component: Dot,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Info: Story = { args: { tone: 'info' } };
export const Success: Story = { args: { tone: 'success' } };
export const Warning: Story = { args: { tone: 'warning' } };
export const Danger: Story = { args: { tone: 'danger' } };

const line = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)' };

/**
 * The click-interval column, which is where the tones earn their keep. Read
 * down the list: the cadence gets more human, the dot gets greener. Grey is
 * reserved for the one row where no reading was taken at all.
 */
export const ClickInterval: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <span style={line}><Dot tone="danger" /> 96 clicks, one every 41s</span>
      <span style={line}><Dot tone="warning" /> 11 clicks in tight runs</span>
      <span style={line}><Dot tone="success" /> 7 clicks, uneven gaps</span>
      <span style={line}><Dot tone="success" /> 2 clicks, no pattern yet</span>
      <span style={line}><Dot tone="neutral" /> No paid clicks</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dots = [...canvasElement.querySelectorAll('.cg-dot')];
    await expect(dots).toHaveLength(5);

    /* Four tones over five rows — `spaced` and `unknown` share green on
       purpose. What must not happen is two of these collapsing by accident, so
       the count is asserted rather than the hex values, which live in tokens. */
    const fills = new Set(dots.map((dot) => getComputedStyle(dot).backgroundColor));
    await expect(fills.size).toBe(4);
  },
};

/** All five, in the order they read from clean to fatal. */
export const AllTones: Story = {
  render: () => (
    <span style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <Dot tone="success" />
      <Dot tone="info" />
      <Dot tone="neutral" />
      <Dot tone="warning" />
      <Dot tone="danger" />
    </span>
  ),
  play: async ({ canvasElement }) => {
    const fills = new Set(
      [...canvasElement.querySelectorAll('.cg-dot')].map((dot) => getComputedStyle(dot).backgroundColor),
    );
    // Five tones, five distinct fills. A duplicate here is a token pointing at
    // the wrong primitive.
    await expect(fills.size).toBe(5);
  },
};
