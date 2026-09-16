import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Callout, EmptyState, Skeleton } from './Feedback';
import { Button } from '../Button/Button';

/**
 * Callout, empty state and skeleton — the three ways this system speaks when
 * there is something to say about the data rather than something to show.
 */
const meta = {
  title: 'Components/Feedback',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Callouts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Callout tone="info">
        The exclusion has been sent to Google Ads and is waiting to be applied. Until it is, this
        visitor can still see your ads.
      </Callout>

      <Callout tone="success" title="Exclusion applied. ">
        No ads have been shown to this address since 15 Sep.
      </Callout>

      <Callout tone="warning" title="We are not certain about this one. ">
        This address belongs to a mobile network, so it can cover thousands of real people. Blocking
        it would remove genuine customers along with the suspicious activity.
      </Callout>

      <Callout tone="danger" title="Sync failed. ">
        Google Ads rejected the exclusion list. Reconnect the account and try again.
      </Callout>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Tone is carried by an icon as well as by colour, so the four are still
    // distinguishable to someone who cannot separate them by hue. The icons are
    // decorative — hidden from assistive tech — so they are counted in the DOM
    // rather than looked up by role.
    await expect(canvasElement.querySelectorAll('.cg-callout .cg-icon')).toHaveLength(4);
  },
};

/** Nothing found. The message says what to do next, not just what is missing. */
export const Empty: Story = {
  render: () => (
    <EmptyState title="No visitors match these filters">
      Widen the date range, or clear the status filter to see every visitor again.
    </EmptyState>
  ),
};

export const EmptyWithAction: Story = {
  render: () => (
    <EmptyState
      icon="shield-check"
      title="No threats in the last 24 hours"
      actions={<Button variant="secondary" iconStart="calendar">Widen to 30 days</Button>}
    >
      Every paid click in this window came from a visitor we have no reason to doubt.
    </EmptyState>
  ),
};

/**
 * Loading. The placeholder holds the shape of the row it replaces, so the table
 * does not jump when the real values arrive.
 */
export const Loading: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <Skeleton width="30%" />
      <Skeleton width="70%" />
      <Skeleton />
    </div>
  ),
};
