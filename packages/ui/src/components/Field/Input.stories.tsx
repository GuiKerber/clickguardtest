import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Search visitors',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Search IP or location' },
};

export const WithIcon: Story = {
  args: { iconStart: 'search', placeholder: 'Search IP or location' },
};

export const Small: Story = { args: { size: 'sm', placeholder: 'Search IP or location' } };
export const Large: Story = { args: { size: 'lg', placeholder: 'Search IP or location' } };

export const WithHelp: Story = {
  args: { help: 'Matches the address and the city, not the campaign name.' },
};

export const Optional: Story = {
  args: { optional: true, placeholder: 'Any' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '203.0.113.47' },
};

/** The label is still announced; only the sighted reader loses it. */
export const HiddenLabel: Story = {
  args: { hideLabel: true, iconStart: 'search', placeholder: 'Search IP or location' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: /search visitors/i })).toBeVisible();
  },
};

/** The message says what is wrong and what to do — never just "invalid". */
export const ErrorState: Story = {
  args: { defaultValue: '203.0.113', error: 'Enter a full IP address, such as 203.0.113.47.' },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    // The message must be wired to the field, not merely printed beneath it.
    await expect(field).toHaveAccessibleDescription(/enter a full ip address/i);
  },
};

/** The clear button only exists while there is something to clear. */
export const Clearable: Story = {
  render: (args) => {
    const [value, setValue] = useState('203.0.113.47');
    return (
      <Input
        {...args}
        iconStart="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue('')}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const clear = canvas.getByRole('button');
    await userEvent.click(clear);
    await expect(canvas.getByRole('textbox')).toHaveValue('');
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};
