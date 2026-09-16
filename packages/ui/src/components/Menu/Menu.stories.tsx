import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from './Menu';

const meta = {
  title: "Components/Menu",
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Actions',
    children: (
      <>
        <MenuLabel>Visitor</MenuLabel>
        <MenuItem onSelect={() => {}}>Block this visitor</MenuItem>
        <MenuItem onSelect={() => {}}>Mark as trusted</MenuItem>
        <MenuSeparator />
        <MenuItem checked disabled>
          Auto-block enabled
        </MenuItem>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /actions/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const AlignEnd: Story = {
  args: {
    label: 'More',
    align: 'end',
    children: <MenuItem onSelect={() => {}}>Export CSV</MenuItem>,
  },
};
