import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Select, type SelectOption } from './Select';

/**
 * A listbox rather than a native `<select>`, so the menu belongs to this design
 * system instead of to the operating system.
 *
 * The options here are the ones Threat Monitoring actually filters by. They are
 * the words the Status column prints, not the values the data model stores:
 * "Not certain" is a monitored address we have low confidence about, but it is
 * what the row says, so it has to be what the filter says.
 */
const options: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'not-certain', label: 'Not certain' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'clean', label: 'Clean' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Status',
    options,
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <Select {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 'all' },
};

/** In the toolbar the label is spoken, not shown — the list says what it filters. */
export const HiddenLabel: Story = {
  args: { value: 'blocked', hideLabel: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: /status/i })).toBeVisible();
  },
};

export const Placeholder: Story = {
  args: { value: '', placeholder: 'Any status' },
};

export const Disabled: Story = {
  args: { value: 'clean', disabled: true },
};

export const WithHelp: Story = {
  args: { value: 'all', help: 'Picking Monitoring leaves out the uncertain ones.' },
};

export const ErrorState: Story = {
  args: { value: '', placeholder: 'Any status', error: 'Choose a status to filter by.' },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveAccessibleDescription(/choose a status/i);
  },
};

// Verifies the listbox actually opens and that picking an option commits it
// back through onChange, not just that the trigger renders.
export const Interaction: Story = {
  args: { value: 'all' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('option', { name: 'Not certain' }));
    await expect(canvas.getByRole('combobox')).toHaveTextContent('Not certain');
  },
};

/**
 * The trigger is sized by its widest option, never by the current one.
 *
 * Sized by the current label, the control changes width every time you pick
 * something — the toolbar reflows and the button moves out from under the
 * pointer that just clicked it. The hidden sizer holds every label at zero
 * height, so the widest one sets the column once and the width stops moving.
 */
export const WidthHoldsAcrossOptions: Story = {
  args: { value: 'all' },
  play: async ({ canvas, userEvent }) => {
    const width = () => Math.round(canvas.getByRole('combobox').getBoundingClientRect().width);
    const before = width();

    for (const label of ['Blocked', 'Not certain', 'Clean']) {
      await userEvent.click(canvas.getByRole('combobox'));
      await userEvent.click(canvas.getByRole('option', { name: label }));
      // To the pixel. "Blocked" is far shorter than "All statuses".
      await expect(width()).toBe(before);
    }
  },
};

/**
 * The selected option is marked by weight and colour, not by a tick.
 *
 * A check beside one row of a five-row list adds a column of empty space to the
 * other four, and it repeats what `aria-selected` already tells a screen
 * reader. The reading is not colour-only either: the chosen row is the heavier
 * one as well as the tinted one.
 */
export const SelectedOptionHasNoTick: Story = {
  args: { value: 'blocked' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));

    const chosen = canvas.getByRole('option', { name: 'Blocked' });
    await expect(chosen).toHaveAttribute('aria-selected', 'true');
    // No icon anywhere in the list — the tick is gone, not merely hidden.
    await expect(canvasElement.querySelectorAll('.cg-select__option .cg-icon')).toHaveLength(0);

    const other = canvas.getByRole('option', { name: 'Clean' });
    const weight = (el: Element) => parseInt(getComputedStyle(el).fontWeight, 10);
    await expect(weight(chosen)).toBeGreaterThan(weight(other));
  },
};

/** Full keyboard operation: open, move, commit, escape. */
export const Keyboard: Story = {
  args: { value: 'all' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(trigger).toHaveTextContent('Blocked');
    // Focus comes back to the trigger, so the next Tab carries on from here.
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
