import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Section } from './Section';

/**
 * A titled block the reader can fold away.
 *
 * Folding hides everything except the title — the note included. A section that
 * keeps talking after being closed has not really closed, and the reader who
 * pressed the arrow is left wondering what the arrow did.
 */
const meta = {
  title: 'Components/Section',
  component: Section,
  parameters: { layout: 'padded' },
  args: {
    title: 'Access history',
    note: 'The steps that led to this visitor’s status, oldest first.',
    children: <p>Timeline goes here.</p>,
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = { args: { defaultOpen: false } };

/** A long title must not push the arrow out of its column. */
export const LongTitle: Story = {
  args: { title: 'Everything we measured about this address before deciding to exclude it' },
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector('.cg-section__heading')!;
    const toggle = canvasElement.querySelector('.cg-section__toggle')!;
    await expect(toggle.getBoundingClientRect().right).toBeLessThanOrEqual(
      Math.ceil(heading.getBoundingClientRect().right),
    );
  },
};

/**
 * Closing takes the whole section with it — note and body both. The title is
 * all that survives, because it is what the reader needs to open it again.
 */
export const Toggling: Story = {
  play: async ({ canvas, userEvent, canvasElement }) => {
    const toggle = canvas.getByRole('button', { name: /collapse access history/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const body = canvasElement.querySelector(`#${CSS.escape(toggle.getAttribute('aria-controls')!)}`)!;
    await expect(body).toBeVisible();

    const tall = canvasElement.querySelector('.cg-section')!.getBoundingClientRect().height;

    await userEvent.click(toggle);
    await expect(body).not.toBeVisible();
    // The note lives inside the fold, so it goes too.
    await expect(canvas.queryByText(/oldest first/i)).not.toBeVisible();
    // Only the title is left.
    await expect(canvas.getByRole('heading', { name: 'Access history' })).toBeVisible();

    /* Measured, not inferred. `toBeVisible` reads the `hidden` attribute, and a
       `display` declared on the element overrides that attribute without
       changing it — which is how this component shipped once looking collapsed
       in the DOM and open on the screen. The section has to actually shrink. */
    await expect(getComputedStyle(body).display).toBe('none');
    const short = canvasElement.querySelector('.cg-section')!.getBoundingClientRect().height;
    await expect(short).toBeLessThan(tall);

    // The label follows the state, so the control says what it will do next.
    await expect(canvas.getByRole('button', { name: /expand access history/i })).toBeVisible();

    await userEvent.click(toggle);
    await expect(body).toBeVisible();
  },
};

/** Operable from the keyboard, because it is a real button. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: /collapse access history/i });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Stacked, each keeping its own state. */
export const Several: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Section title="Access history" note="Oldest first.">
        <p>Timeline goes here.</p>
      </Section>
      <Section title="Signals we measured" defaultOpen={false}>
        <p>Signal cards go here.</p>
      </Section>
    </div>
  ),
};
