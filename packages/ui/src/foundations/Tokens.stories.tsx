import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import './tokens-page.css';

/**
 * The foundations page reads nothing from a hand-written list.
 *
 * Every row below is pulled out of the live `:root` rule in tokens.css at
 * render time, so a token added, renamed or retuned in the stylesheet shows up
 * here on the next reload with no second place to update. A documentation page
 * that restates its own source is a design system with two sources of truth;
 * this one has one.
 */

interface Token {
  name: string;
  /** What the author wrote, e.g. `var(--color-indigo-900)`. */
  declared: string;
  /** What the browser paints, e.g. `#111553`. */
  resolved: string;
}

function readRootTokens(): Token[] {
  const root = getComputedStyle(document.documentElement);
  const seen = new Map<string, Token>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    // A stylesheet from another origin throws on access; it has no tokens of
    // ours in it, so skipping it loses nothing.
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') continue;

      for (const name of Array.from(rule.style)) {
        if (!name.startsWith('--')) continue;
        seen.set(name, {
          name,
          declared: rule.style.getPropertyValue(name).trim(),
          resolved: root.getPropertyValue(name).trim(),
        });
      }
    }
  }

  return Array.from(seen.values());
}

const isColour = (value: string) => /^(#|rgb|hsl|oklch|color-mix)/i.test(value);
const isLength = (value: string) => /^-?[\d.]+(px|rem|em)$/.test(value);

/** Groups by the token's first segment: `--status-danger-text` → `status`. */
function groupOf(name: string) {
  const [group = 'other'] = name.split('-').filter(Boolean);
  return group;
}

function Swatch({ token }: { token: Token }) {
  if (isColour(token.resolved)) {
    return <span className="tk__swatch" style={{ background: `var(${token.name})` }} />;
  }

  if (isLength(token.resolved) && /space|radius|width|height|size/.test(token.name)) {
    const radius = token.name.includes('radius');
    return (
      <span className="tk__swatch tk__swatch--empty">
        <span
          className="tk__bar"
          style={
            radius
              ? { borderRadius: `var(${token.name})`, width: '100%', height: '100%' }
              : { width: `min(100%, var(${token.name}))` }
          }
        />
      </span>
    );
  }

  return <span className="tk__swatch tk__swatch--empty" />;
}

function TokenTable({ filter }: { filter?: (token: Token) => boolean }) {
  const [tokens, setTokens] = useState<Token[]>([]);

  // Read after paint: the stylesheet has to be in the document first.
  useEffect(() => setTokens(readRootTokens()), []);

  const shown = filter ? tokens.filter(filter) : tokens;
  const groups = new Map<string, Token[]>();
  for (const token of shown) {
    const key = groupOf(token.name);
    groups.set(key, [...(groups.get(key) ?? []), token]);
  }

  if (!shown.length) return <p className="tk__note">No tokens matched.</p>;

  return (
    <div className="tk">
      <p className="tk__note">
        {shown.length} tokens, read live from <code>src/styles/tokens.css</code>.
      </p>

      {Array.from(groups, ([group, list]) => (
        <section className="tk__group" key={group}>
          <h3 className="tk__group-title">{group}</h3>
          <ul className="tk__list">
            {list.map((token) => (
              <li className="tk__row" key={token.name}>
                <Swatch token={token} />
                <code className="tk__name">{token.name}</code>
                <code className="tk__declared">{token.declared}</code>
                {token.declared !== token.resolved && (
                  <code className="tk__resolved">{token.resolved}</code>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: TokenTable,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TokenTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Layer 1. Raw values, and the only place in the system a hex code is written.
 * Components never name these — they are the palette, not the vocabulary.
 */
export const Primitives: Story = {
  args: { filter: (token: Token) => token.declared === token.resolved && !token.declared.startsWith('var(') },
  play: async () => {
    // Guards the arrangement the whole system rests on: if tokens.css stopped
    // loading, every component would silently fall back to browser defaults.
    const indigo = getComputedStyle(document.documentElement).getPropertyValue('--color-indigo-900');
    await expect(indigo.trim()).not.toBe('');
  },
};

/**
 * Layer 2. What components are allowed to name. Each one points at a primitive,
 * so retuning the brand is a change in layer 1 that nothing else has to follow.
 */
export const Semantic: Story = {
  args: { filter: (token: Token) => token.declared.startsWith('var(') },
  play: async () => {
    // Semantic tokens must resolve to something real, not to an empty string —
    // a typo in a var() name fails silently in CSS and shows up as no colour.
    const root = getComputedStyle(document.documentElement);
    for (const name of ['--text-primary', '--action-primary-bg', '--risk-blocked-text', '--layer-panel']) {
      await expect(root.getPropertyValue(name).trim()).not.toBe('');
    }
  },
};

/** Everything, in one list, for searching by name. */
export const All: Story = {};
