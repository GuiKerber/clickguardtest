import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Pill, type PillTone } from './Pill';

/**
 * A tag that states one fact and colours it.
 *
 * Colour never travels alone here: every tone pairs with an icon and a word, so
 * the pill still reads for someone who cannot separate two of these hues.
 */
const meta = {
  title: 'Components/Pill',
  component: Pill,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Two families. The generic tones are the system's vocabulary; the risk tones
   are a domain layer aliasing them, so Threat Monitoring can name what it means
   rather than the colour it wants. */
const generic: { tone: PillTone; icon: 'info' | 'check-circle' | 'alert-circle' | 'shield-blocked'; label: string }[] = [
  { tone: 'neutral', icon: 'info', label: 'Neutral' },
  { tone: 'info', icon: 'info', label: 'Info' },
  { tone: 'success', icon: 'check-circle', label: 'Success' },
  { tone: 'warning', icon: 'alert-circle', label: 'Warning' },
  { tone: 'danger', icon: 'shield-blocked', label: 'Danger' },
];

const risk: { tone: PillTone; icon: 'shield-check' | 'eye' | 'alert-circle' | 'shield-blocked'; label: string }[] = [
  { tone: 'clean', icon: 'shield-check', label: 'Clean' },
  { tone: 'monitoring', icon: 'eye', label: 'Monitoring' },
  { tone: 'suspicious', icon: 'alert-circle', label: 'Suspicious' },
  { tone: 'malicious', icon: 'shield-blocked', label: 'Malicious' },
  { tone: 'blocked', icon: 'shield-blocked', label: 'Blocked' },
];

const row = { display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' as const, alignItems: 'center' };

/** Every tone the component ships, in one place. */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={row}>
        {generic.map((p) => (
          <Pill key={p.tone} tone={p.tone} icon={p.icon}>
            {p.label}
          </Pill>
        ))}
      </div>
      <div style={row}>
        {risk.map((p) => (
          <Pill key={p.tone} tone={p.tone} icon={p.icon}>
            {p.label}
          </Pill>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pills = [...canvasElement.querySelectorAll('.cg-pill')];
    await expect(pills).toHaveLength(10);

    /* Ten tones, five fills — on purpose. The risk tones are a domain alias
       over the status ones (design.md §3), so `suspicious` is `warning` wearing
       the word this product uses. Asserting the count keeps that a decision
       rather than a coincidence: a sixth fill would mean someone broke the
       aliasing, and a fourth would mean two states had collapsed into one. */
    const fills = new Set(pills.map((p) => getComputedStyle(p).backgroundColor));
    await expect(fills.size).toBe(5);
  },
};

/* ---- The generic vocabulary ---- */

export const Neutral: Story = { args: { tone: 'neutral', icon: 'info', children: 'Neutral' } };
export const Info: Story = { args: { tone: 'info', icon: 'info', children: 'Info' } };
export const Success: Story = { args: { tone: 'success', icon: 'check-circle', children: 'Success' } };
export const Warning: Story = { args: { tone: 'warning', icon: 'alert-circle', children: 'Warning' } };
export const Danger: Story = { args: { tone: 'danger', icon: 'shield-blocked', children: 'Danger' } };

/* ---- The risk layer ---- */

export const Clean: Story = { args: { tone: 'clean', icon: 'shield-check', children: 'Clean' } };
export const Monitoring: Story = { args: { tone: 'monitoring', icon: 'eye', children: 'Monitoring' } };
export const Suspicious: Story = { args: { tone: 'suspicious', icon: 'alert-circle', children: 'Suspicious' } };
export const Malicious: Story = { args: { tone: 'malicious', icon: 'shield-blocked', children: 'Malicious' } };

/** Blocked is red, and shares its tone with malicious — see design.md §4. */
export const Blocked: Story = { args: { tone: 'blocked', icon: 'shield-blocked', children: 'Blocked' } };

/* ---- Shape and size ---- */

export const Small: Story = { args: { tone: 'neutral', size: 'sm', children: 'free' } };

/**
 * No icon, no colour meaning — for a word that is its own label.
 */
export const TextOnly: Story = { args: { tone: 'neutral', children: 'free' } };

/**
 * An icon with no word is a marker, not a tag, so it takes the full radius: at
 * that size an 8px corner reads as a clipped tag rather than a deliberate
 * shape. The component applies the rule itself rather than leaving it to be
 * remembered.
 */
export const IconOnly: Story = {
  args: { tone: 'warning', icon: 'server', label: 'Datacentre server, not a home connection' },
  play: async ({ canvasElement }) => {
    const pill = canvasElement.querySelector('.cg-pill')!;
    await expect(pill).toHaveClass('cg-pill--icon-only');
    // Fully rounded, not the 8px tag corner.
    const radius = parseFloat(getComputedStyle(pill).borderRadius);
    await expect(radius).toBeGreaterThan(100);
  },
};

/** The three origins the table marks, which is where icon-only pills earn their keep. */
export const DeviceMarkers: Story = {
  render: () => (
    <span style={row}>
      <Pill tone="warning" icon="server" label="Datacentre server, not a home connection" />
      <Pill tone="info" icon="computer" label="Desktop, home or office network" />
      <Pill tone="success" icon="device" label="Mobile device" />
      <Pill tone="neutral" icon="robot" label="Verified search engine crawler" />
    </span>
  ),
  play: async ({ canvas }) => {
    // The label is the only thing carrying the meaning, so it has to be spoken.
    await expect(canvas.getByRole('img', { name: /datacentre server/i })).toBeVisible();
  },
};

/** A long label must wrap the pill, never spill out of it. */
export const LongLabel: Story = {
  args: {
    tone: 'monitoring',
    icon: 'eye',
    children: 'Monitoring — shared carrier address, thousands of real people behind it',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--space-48)' }}>
        <Story />
      </div>
    ),
  ],
};
