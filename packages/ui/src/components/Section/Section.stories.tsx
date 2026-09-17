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

/**
 * The arrow points at the content, not at the motion.
 *
 * Closed it points down — the body is below, waiting. Open it points up, which
 * is where the reader came from and where the fold goes back to. Pointing the
 * same way in both states, or sideways in one, leaves the control saying only
 * "there is a control here".
 */
export const ArrowFollowsState: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const section = canvasElement.querySelector('.cg-section')!;

    /* The state, then the rules that read it — not the computed transform.
       The arrow is animated, and a computed `transform` mid-transition is the
       frame the easing curve happens to be on; in a throttled or hidden frame
       it may never advance at all. So the assertion checks the two halves that
       are actually deterministic: the attribute the CSS keys off, and the
       declarations keyed off it. */
    await expect(canvas.getByRole('button', { name: /collapse/i })).toBeVisible();
    await expect(section).toHaveAttribute('data-open');

    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('button', { name: /expand/i })).toBeVisible();
    await expect(section).not.toHaveAttribute('data-open');

    const rules = [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules];
        } catch {
          return [];
        }
      })
      .filter((rule): rule is CSSStyleRule => 'selectorText' in rule)
      .filter((rule) => rule.selectorText.includes('cg-section__toggle .cg-icon'));

    const closed = rules.find((rule) => !rule.selectorText.includes('data-open'));
    const open = rules.find((rule) => rule.selectorText.includes('data-open'));

    // Closed is the glyph as drawn, pointing down at the body it will reveal.
    await expect(closed!.style.transform).toBe('rotate(0deg)');
    // Open is a half turn, so the same glyph points back up.
    await expect(open!.style.transform).toBe('rotate(180deg)');
  },
};

/**
 * The note is a caption on the title, so it sits one notch below it rather than
 * a full step. Any further and it reads as the first line of the body, which is
 * the one thing it is not.
 */
export const NoteSitsWithTheTitle: Story = {
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector('.cg-section__heading')!.getBoundingClientRect();
    const note = canvasElement.querySelector('.cg-section__note')!.getBoundingClientRect();
    const gap = Math.round(note.top - heading.bottom);
    // Read against the scale rather than restated: retuning --space-1 must move
    // this test with it, not break it.
    const step = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--space-1'),
    );
    await expect(gap).toBe(Math.round(step));
  },
};

/** Without a note, the body keeps its full step below the heading. */
export const NoNote: Story = {
  args: { note: undefined },
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector('.cg-section__heading')!.getBoundingClientRect();
    const body = canvasElement.querySelector('.cg-section__body')!.getBoundingClientRect();
    const step = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--space-1'),
    );
    await expect(Math.round(body.top - heading.bottom)).toBeGreaterThan(Math.round(step));
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
