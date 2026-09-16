import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { MultiSelect } from './MultiSelect';
import type { SelectOption } from './Select';

const options: SelectOption[] = [
  { value: 'blocked', label: 'Blocked' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'clean', label: 'Clean' },
];

/**
 * The same control as Select, for choices that are not mutually exclusive.
 *
 * Toggling an option leaves the list open: picking three filters should not
 * cost three trips back to the trigger. The summary says "All statuses" or
 * "2 statuses" rather than listing them, so the trigger width never moves.
 */
function Demo(args: Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'onChange'> & { initial?: string[] }) {
  const [value, setValue] = useState<string[]>(args.initial ?? []);
  return <MultiSelect {...args} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Components/MultiSelect',
  component: Demo,
  parameters: { layout: 'centered' },
  args: { label: 'Status', options, summaryNoun: 'statuses' },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const SomeSelected: Story = { args: { initial: ['blocked', 'monitoring'] } };

export const AllSelected: Story = { args: { initial: ['blocked', 'monitoring', 'clean'] } };

export const Small: Story = { args: { size: 'sm', initial: ['blocked'] } };
export const Large: Story = { args: { size: 'lg', initial: ['blocked'] } };

export const Disabled: Story = { args: { disabled: true, initial: ['clean'] } };

export const WithHelp: Story = {
  args: { help: 'Leave empty to see every visitor.' },
};

export const WithError: Story = {
  args: { error: 'Pick at least one status.' },
};

/** The list must stay open across several toggles, which is the whole point. */
export const StaysOpenWhileToggling: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(canvas.getByRole('option', { name: 'Blocked' }));
    await userEvent.click(canvas.getByRole('option', { name: 'Clean' }));

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('option', { name: 'Blocked' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('option', { name: 'Clean' })).toHaveAttribute('aria-selected', 'true');
  },
};

/** Fully operable without a mouse — arrows move, Enter toggles, Escape closes. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    // The list opens with the first option active, so Enter alone takes it…
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('option', { name: 'Blocked' })).toHaveAttribute('aria-selected', 'true');

    // …and one step down takes the next, without closing the list in between.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByRole('option', { name: 'Monitoring' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
