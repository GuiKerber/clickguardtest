import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../Button/Button';
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

/**
 * `grow` gives the field the spare width of its row, up to a cap — for the one
 * control in a toolbar that deserves the slack. The cap matters: uncapped, this
 * field would push the controls beside it to the far edge of a wide screen.
 */
export const Grow: Story = {
  globals: { viewport: { value: 'wide' } },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-2)', width: 'var(--space-96)' }}>
      <Input {...args} grow iconStart="search" placeholder="Search IP or location" />
      <Button variant="secondary" iconStart="download">Export CSV</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('.cg-field--grow')!;
    const button = canvasElement.querySelector('.cg-btn')!;
    // It takes the slack, and leaves the control beside it on the same line.
    await expect(field.getBoundingClientRect().width).toBeGreaterThan(
      button.getBoundingClientRect().width,
    );
    await expect(Math.round(field.getBoundingClientRect().top)).toBe(
      Math.round(button.getBoundingClientRect().top),
    );
  },
};

/** The cap holding: given far more room than it needs, it stops at the token. */
export const GrowIsCapped: Story = {
  // The cap only exists above the stack breakpoint, so the test has to say
  // which layout it is testing rather than inherit the reader's pane width.
  globals: { viewport: { value: 'wide' } },
  render: (args) => (
    <div style={{ width: 'calc(var(--space-96) * 2)' }}>
      <Input {...args} grow iconStart="search" placeholder="Search IP or location" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('.cg-field--grow')!;
    // Read the cap rather than restate it: retuning the token must move this
    // test with it, not break it.
    const cap = parseFloat(getComputedStyle(field).maxWidth);
    await expect(cap).toBeGreaterThan(0);
    await expect(field.getBoundingClientRect().width).toBeLessThanOrEqual(cap);
  },
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

/**
 * The toolbar's search field: one clear control, not two.
 *
 * `type="search"` makes WebKit and Blink draw their own cancel button inside
 * the field, so a search input with our clear button shows two crosses side by
 * side and only one of them tells React anything. The stylesheet removes the
 * browser's, which is why this story asserts the count rather than trusting it.
 */
export const SearchType: Story = {
  render: (args) => {
    const [value, setValue] = useState('203.0.113.47');
    return (
      <Input
        {...args}
        type="search"
        hideLabel
        iconStart="search"
        placeholder="Search by IP, city or country"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue('')}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('searchbox');
    // Ours is the only control in the field that is a control at all.
    await expect(canvas.getAllByRole('button')).toHaveLength(1);

    /* The browser's cancel button is painted by the engine, not appended to the
       DOM: it has no node, no role and no reliable computed style to read back.
       The rule that removes it is the only thing that can be asserted, so the
       assertion goes looking for the rule. Without it this field ships two
       crosses, and only one of them tells React anything. */
    const rules = [...document.styleSheets].flatMap((sheet) => {
      try {
        return [...sheet.cssRules];
      } catch {
        return [];
      }
    });
    const removed = rules.some(
      (rule) =>
        'selectorText' in rule &&
        String(rule.selectorText).includes('-webkit-search-cancel-button') &&
        (rule as CSSStyleRule).style.display === 'none',
    );
    await expect(removed).toBe(true);

    await userEvent.click(canvas.getByRole('button', { name: /clear/i }));
    await expect(field).toHaveValue('');
  },
};
