import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { InfoTip } from './Tooltip';

const meta = {
  title: 'Components/InfoTip',
  component: InfoTip,
  parameters: { layout: 'centered' },
  args: {
    term: 'click fraud',
    children: "Repeated, non-genuine clicks on an ad, meant to drain the advertiser's budget.",
  },
} satisfies Meta<typeof InfoTip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Opens on hover, on focus and on click; closes on blur and on Escape.
 * A tooltip that only answers the mouse is not an explanation, it is decoration.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /what is click fraud/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    // The tip opens through React state, a render after the event.
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(canvas.getByRole('tooltip')).toBeVisible());
  },
};

/** Reachable and dismissable without a mouse. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /what is click fraud/i });

    // Reachable by keyboard at all: Tab has to land on it.
    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    /* Then the focus handler itself, dispatched rather than implied. A browser
       whose document is not itself focused — a background tab, a headless run —
       moves `activeElement` without emitting a focus event, so driving this
       through Tab alone tests the runner's window manager as much as the
       component. Firing the event directly asserts the behaviour that matters:
       arriving on this control opens the tip, however the reader got here. */
    /* `focusIn`, not `focus`: React attaches its listeners at the root and maps
       `onFocus` onto the bubbling `focusin` event, so a raw `focus` never
       reaches the handler. */
    fireEvent.focusIn(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};

/**
 * The explanation is wired to the trigger with `aria-describedby`, so a screen
 * reader reads it as part of the control rather than as loose text nearby.
 */
export const Described: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /what is click fraud/i });
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAccessibleDescription(/repeated, non-genuine clicks/i));
  },
};

/** Anchored to the end when the trigger sits near the right edge. */
export const AlignEnd: Story = {
  args: { align: 'end' },
};
