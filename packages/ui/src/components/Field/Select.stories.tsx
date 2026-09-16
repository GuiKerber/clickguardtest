import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Select, type SelectOption } from './Select';

const options: SelectOption[] = [
  { value: 'clean', label: 'Clean' },
  { value: 'suspicious', label: 'Suspicious' },
  { value: 'malicious', label: 'Malicious' },
];

const meta = {
  title: "Components/Select",
  component: Select,
  args: {
    label: 'Classification',
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
  args: { value: 'clean' },
};

export const Placeholder: Story = {
  args: { value: '', placeholder: 'Choose a classification' },
};

// Verifies the listbox actually opens and that picking an option commits it
// back through onChange, not just that the trigger renders.
export const Interaction: Story = {
  args: { value: 'clean' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('option', { name: 'Malicious' }));
    await expect(canvas.getByRole('combobox')).toHaveTextContent('Malicious');
  },
};
