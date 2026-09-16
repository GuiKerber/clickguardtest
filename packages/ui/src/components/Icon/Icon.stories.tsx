import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon } from './Icon';
import { icons } from './icons';

/**
 * Hugeicons stroke set, inlined at build time.
 *
 * Every path ships with its `stroke-width` attribute stripped, so the weight
 * resolves from `--icon-stroke-width` instead of from whatever the pack
 * happened to export. That is the only reason an icon can sit next to 14px text
 * without looking heavier than it.
 */
const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  args: { name: 'shield-check' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: () => (
    <span style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
      <Icon name="shield-check" size="sm" />
      <Icon name="shield-check" size="md" />
      <Icon name="shield-check" size="lg" />
    </span>
  ),
};

/** The whole set. A missing glyph shows up here before it ships in a screen. */
export const AllIcons: Story = {
  render: () => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(var(--space-24), 1fr))',
        gap: 'var(--space-4)',
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}
    >
      {(Object.keys(icons) as (keyof typeof icons)[]).map((name) => (
        <li
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            border: 'var(--border-width-thin) solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-100)',
          }}
        >
          <Icon name={name} size="md" />
          {name}
        </li>
      ))}
    </ul>
  ),
};

/** Continuous rotation for a busy state. Pair it with `aria-busy` on the parent. */
export const Spinning: Story = { args: { name: 'loading', spin: true, size: 'lg' } };

/**
 * An icon is decorative unless it is the only thing carrying the meaning. With
 * no `label` it is hidden from assistive tech; with one it becomes an image
 * with a name.
 */
export const Labelled: Story = {
  args: { name: 'shield-blocked', label: 'Blocked', size: 'lg' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Blocked' })).toBeVisible();
  },
};

export const Decorative: Story = {
  args: { name: 'shield-blocked', size: 'lg' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};
