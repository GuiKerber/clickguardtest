import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Section } from './Section';

/**
 * A titled block the reader can fold away.
 *
 * The whole heading row is the control, not just the arrow: a 16px target for
 * an action the entire row already looks like it performs is a target most
 * people miss. The arrow still turns, because it is what says the row can be
 * pressed at all.
 */
const meta = {
  title: 'Components/Section',
  component: Section,
  parameters: { layout: 'padded' },
  args: {
    title: 'Access history',
    children: <p>The steps that led to this visitor’s status, oldest first.</p>,
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = { args: { defaultOpen: false } };

/** A count on the title row, so a folded section still reports its size. */
export const WithAside: Story = {
  args: { aside: '7 steps' },
};

/**
 * The note sits outside the fold on purpose: a closed section should still say
 * what is inside it, or folding one costs the reader the ability to find it.
 */
export const WithNote: Story = {
  args: {
    defaultOpen: false,
    aside: '6 signals',
    note: 'Open a signal to see what it means and how it moved the score.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/open a signal to see/i)).toBeVisible();
  },
};

/** A long title must not push the arrow out of its column. */
export const LongTitle: Story = {
  args: {
    title: 'Everything we measured about this address before deciding to exclude it',
    aside: '12 items',
  },
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('.cg-section__toggle')!;
    const arrow = canvasElement.querySelector('.cg-section__arrow')!;
    await expect(arrow.getBoundingClientRect().right).toBeLessThanOrEqual(
      Math.ceil(toggle.getBoundingClientRect().right),
    );
  },
};

/**
 * The body is wired to the control with `aria-controls` and `aria-expanded`,
 * and hidden with `hidden` rather than `display:none` — so it leaves the
 * accessibility tree, not just the screen.
 */
export const Toggling: Story = {
  args: { aside: '7 steps' },
  play: async ({ canvas, userEvent, canvasElement }) => {
    const toggle = canvas.getByRole('button', { name: /access history/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const bodyId = toggle.getAttribute('aria-controls')!;
    const body = canvasElement.querySelector(`#${CSS.escape(bodyId)}`)!;
    await expect(body).toBeVisible();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Visibility, not presence: the body stays in the DOM and is hidden with
    // the `hidden` attribute, which takes it out of the accessibility tree too.
    await expect(body).not.toBeVisible();
    await expect(body).toHaveAttribute('hidden');

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toBeVisible();
  },
};

/** Operable from the keyboard, because it is a real button. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: /access history/i });
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
      <Section title="Access history" aside="7 steps" note="Oldest first.">
        <p>Timeline goes here.</p>
      </Section>
      <Section title="Signals we measured" aside="6 signals" defaultOpen={false}>
        <p>Signal cards go here.</p>
      </Section>
    </div>
  ),
};
