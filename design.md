# ClickGuard Design System — Foundations

Brand extraction and token decisions for the Threat Monitoring prototype.

**Source of truth:** computed CSS sampled from `clickguard.com`, `clickguard.com/pricing`
and `auth.clickguard.com` (the auth screen renders the real product UI behind its
modal — navy topbar, light sidebar, white data tables). Nothing here was eyeballed
from a screenshot.

**Where the system lives**

The design system is an npm workspace package, `@clickguard/ui`. The prototype
lists it as a dependency and imports from it like any other library; Storybook
globs the same `src/` directory. There is no build step between them and no copy
to drift — the app and the documentation compile the same files.

| Path | Contains |
| --- | --- |
| `packages/ui/src/styles/tokens.css` | Primitives + semantic tokens. The only place a hex value may appear. |
| `packages/ui/src/styles/base.css` | Reset, document defaults, typography classes, focus, motion. |
| `packages/ui/src/components/` | One folder per component: `.tsx`, `.css`, `.stories.tsx`. |
| `apps/prototype/` | The Threat Monitoring screen. Declares no colour, size or duration of its own. |

Storybook's **Foundations → Tokens** page reads the live `:root` rule at render
time rather than restating a list, so a token added here appears there with
nothing else to update. A documentation page that repeats its own source is a
design system with two truths.

---

## 1. Design direction

ClickGuard reads as **serious security software with one electric accent**. The
palette is almost monochrome — deep indigo on cool greys — interrupted by a single
acid lemon that is reserved for action. Type is a tight grotesk set at weight 500
by default, which buys density without looking heavy. The brand already labels its
data points in a monospace face, which is a strong hint that **numbers belong in mono**.

The product surface is quieter than the marketing site: smaller radii, no gradients,
no glow. This system follows the product, not the landing page.

---

## 2. What the marketing site gave us, and what it didn't

**Taken as-is:** the indigo and lemon values, the full greyscale, Host Grotesk at
weight 500, the 8px radius and pill button from the app, the 1px hairline borders,
the 0.3s ease transition, the mono-uppercase label treatment.

**Rejected:**

| Rejected | Why |
| --- | --- |
| The 16px and 24px marketing radii | A 24px corner on a 44px table row reads as a toy. The app already standardised on 8px; the product follows the app. |
| Every shadow and the lemon glow | Depth via shadow is decorative here. In a dense table it creates visual noise and makes rows look clickable when they aren't. Hierarchy is carried by surface colour and 1px borders instead. |
| The `72px` / `64px` heading tokens | Marketing scale. Headings on a product screen top out at 32px. |
| The residual Webflow template variables (`--base-color-system--*`, `--elements-webflow-library--*`) | They are flagged `<deleted>` in the live CSS. Template leftovers, not brand. |
| `#D2FB0C` (lemon glow) | Only existed to tint a shadow. Dropped with the shadows. |
| `#5517EF` (marketing purple gradient) | Marketing-only. The product uses `indigo-500` for action and `indigo-900` for structure. |
| Lemon as a "success" colour | Lemon is the CTA. If a clean visitor were also lemon, the primary button and the safest row would be the same colour. |

---

## 3. Token architecture

Two layers, plus a domain alias:

```
PRIMITIVE            SEMANTIC                      COMPONENT
--color-red-600  →   --status-danger-icon      →   the pill icon
                 →   --risk-malicious-icon
```

* **Primitives** (`--color-indigo-500`, `--space-4`, `--font-size-300`) are raw
  values. A component never references one.
* **Semantic tokens** (`--text-primary`, `--surface-raised`, `--field-border-error`)
  name a role. Components reference only these.
* **Risk tokens** are a third, domain-specific alias layer over status
  (`--risk-malicious-* → --status-danger-*`). Naming the domain meaning once means
  the severity palette can be retuned in a single file without opening a screen.

A raw hex, px, or ms value in a component file is a bug.

---

## 4. Colour

### Indigo — brand, structure, text

| Token | Value | Role |
| --- | --- | --- |
| `indigo-100` | `#EEEDFF` | selected row, info surface |
| `indigo-200` | `#D9D8EA` | subtle divider |
| `indigo-500` | `#554BFD` | links, focus ring, info icon |
| `indigo-900` | `#111553` | primary text, topbar, inverse surface |

`indigo-50/300/400/600/700/800` complete the ramp; 300 and 400 are brand values,
the rest are derived for hover/active states.

### Lemon — CTA and brand only

| Token | Value | Role |
| --- | --- | --- |
| `lemon-100` | `#EEFF9D` | primary button fill |
| `lemon-200` | `#E2F97A` | primary button hover |
| `lemon-300` | `#D2EB4E` | primary button active |
| `lemon-400` | `#BAE101` | primary button border |

Lemon never carries state or meaning. One lemon button per view.

### Neutral

`#FAFAFA` page → `#FFFFFF` card → `#F2F2F2` table head, with `#E1E1E1` dividers,
`#C8C8C8` field borders, `#616064` secondary text, `#111553` primary text.
Eight of eleven steps are sampled directly from the brand.

### Risk — classic severity, contrast-tested

Traditional red / amber / green, because a PPC manager scanning a table of
blocked visitors should not have to learn a palette. Every pair below was measured:

| Meaning | Surface | Text | Ratio | Icon | Ratio on white |
| --- | --- | --- | --- | --- | --- |
| Clean | `#ECFDF5` | `#047857` | **5.20:1** | `#059669` | 3.77:1 |
| Suspicious | `#FFFBEB` | `#92400E` | **6.84:1** | `#B45309` | 5.02:1 |
| Malicious | `#FEF2F2` | `#991B1B` | **7.71:1** | `#B91C1C` | 6.47:1 |
| Monitoring | `#EEEDFF` | `#111553` | **14.5:1** | `#554BFD` | 5.51:1 |
| Blocked | `#FEF2F2` | `#991B1B` | **7.71:1** | `#B91C1C` | 6.47:1 |

`amber-500` and `green-500` are the canonical brand-bright tones of those hues but
measure 2.15:1 and 2.54:1 on white. They are kept as decorative fills only and are
documented as **never text**.

**Blocked is red — and this reverses an earlier decision.**

The first version made blocked navy, on the argument that *how dangerous is this
visitor* and *what did we do about it* are different questions that deserve
different hues. That reasoning is sound in the abstract and wrong in this table.

Red was the only severity colour with no job left. Malicious already reads as red
through the risk bar and the score, so a navy "Blocked" pill sitting in a red row
asked the user to hold two colour systems at once — severity in one, disposition
in the other — to answer the single question they actually came for: *is this
address still costing me money?* Blocking is the outcome of severity, not a
parallel axis. Giving the strongest state the strongest colour costs nothing,
because the pill carries an icon and the word "Blocked" either way.

What the navy version got right is kept: the pill still names the action, never
just the danger. Disposition is legible without colour at all.

Colour never carries meaning alone: every status pill pairs a colour with an icon
and a text label.

### Accessibility fix carried over from the live app

The production sign-in button renders `#9F9EA3` on `#EEFF9D` when disabled — **2.4:1**,
a clear AA failure. This system disables to `#616064` on `#F2F2F2` — **5.6:1** — which
also reads as disabled faster, because the fill goes grey instead of staying lemon.

---

## 5. Typography

**Host Grotesk** (brand, variable, weights 400–800) for everything.
**JetBrains Mono** stands in for the brand's Aux Mono, which isn't publicly
distributed — same role, available licence. Swapping back is a one-line change.

Default body weight is **500**, inherited from the brand. That single choice does
most of the work of making the UI feel like ClickGuard rather than like Tailwind.

| Class | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| `.text-display-lg` | 32 / 36 | 500 | KPI figure |
| `.text-display-md` | 28 / 32 | 500 | KPI figure, secondary |
| `.text-heading-lg` | 24 / 30 | 500 | page title |
| `.text-heading-md` | 20 / 26 | 500 | section / drawer title |
| `.text-heading-sm` | 16 / 22 | 600 | card title, table group |
| `.text-body-lg` | 16 / 22 | 500 | prose |
| `.text-body-md` | 14 / 20 | 500 | **UI default** — cells, buttons, menus |
| `.text-body-sm` | 13 / 18 | 500 | dense cell, helper text |
| `.text-label-md` | 14 / 18 | 500 | form label |
| `.text-label-sm` | 12 / 16 | 500 | meta, caption, timestamp |
| `.text-overline` | 12 / 16 mono, +0.06em, uppercase | 500 | column label, eyebrow |
| `.text-data-md` | 13 / 18 mono, tabular | 500 | IP, score, currency |
| `.text-data-sm` | 12 / 16 mono, tabular | 500 | dense numeric cell |

14px at weight 500 is the most-used pair on the live site (145 nodes) — adopting it
as the UI default keeps the product and the brand in the same voice.

One size sits outside the class table: `--font-size-900` (40 / 44) exists only for
the risk score at the centre of the gauge. It has no utility class because it is
not a text style anyone should reach for — it is one number, in one component,
which happens to be the single figure the drawer is built around.

Headings reset to `inherit`: semantic level and visual size are chosen separately,
so a screen can start at `h1` without being forced to look loud.

Mono + `tabular-nums` on data columns means IPs and figures align vertically
without per-cell alignment hacks — the reason the brand already sets its stat
labels in mono.

---

## 6. Spacing

4px base: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Derived from the values
already in use on the site (button `8/24`, input `10/14`, card `24`, grid gap `20`).

## 7. Radius

Two shapes, plus a named zero.

| Token | Value | Applies to |
| --- | --- | --- |
| `--radius-none` | `0px` | square by intention — swatches, flush edges |
| `--radius-md` | `8px` | inputs, selects, cards, tables, labelled pills, menus |
| `--radius-full` | `9999px` | buttons, avatars, toggles, **icon-only pills** |

`--radius-none` exists so that "this corner is square on purpose" and "nobody set
a radius here" are different statements in the code.

**Icon-only pills are fully rounded.** A pill containing a word is a tag and takes the
8px corner. A pill containing only an icon is a marker, and at that size an 8px corner
reads as a clipped tag rather than a deliberate shape. `Pill` applies this itself when
no children are passed — it is a rule in the component, not a convention to remember.

There is deliberately no 4px step. See §15 for the one case that may eventually
need one.

## 8. Elevation

None. No shadows anywhere, per brand direction.

Depth is expressed as: `#FAFAFA` page → `#FFFFFF` raised surface → 1px `#E1E1E1`
border. Floating layers (dropdown menu, drawer) separate with a `#C8C8C8` border
against the white surface plus a `rgb(17 21 83 / 0.40)` scrim for modal layers.
This is the one place where dropping shadows costs something, and the scrim is
what pays for it.

**Stacking order is a token, not a guess.** With no shadow scale to imply depth,
the only thing deciding what covers what is `z-index` — so it is named rather
than picked per component.

| Token | Value | Layer |
| --- | --- | --- |
| `--layer-sticky` | 1 | table head pinned inside its own scroll area |
| `--layer-dropdown` | 20 | select and menu lists, anchored to a control |
| `--layer-scrim` | 30 | dims the page under a panel |
| `--layer-panel` | 40 | drawer |
| `--layer-tooltip` | 50 | must clear the panel it is explaining |

Read top to bottom, it is the order a user meets them. Gaps of ten leave room to
slot a layer in without renumbering the rest. Two floating elements can no longer
tie by accident, which is the bug this replaces.

## 9. Motion

`150ms` / `200ms` / `300ms` with `cubic-bezier(0.2, 0, 0, 1)`. The brand uses
`0.3s ease`, which sits at the top of that range. `prefers-reduced-motion: reduce`
collapses durations to ~0 rather than removing the state change, so the end state
is still reached.

## 10. Sizing and density

| Control size | Height | Use |
| --- | --- | --- |
| `sm` | 32px | inside a table row, toolbars |
| `md` | 40px | default |
| `lg` | 48px | primary page action, forms |

| Table density | Row height |
| --- | --- |
| compact | 36px |
| default | 44px |
| comfortable | 56px |

`Progress` ships two layouts for the same reason. `stacked` puts the labels above a
full-height bar, for cards and panels. `inline` puts the number to the left of a slim
4px bar, for table rows — where vertical space, not horizontal, is the scarce resource.

On a coarse pointer, `sm`, `md` and the compact row all grow to
`--control-height-touch` (**44px**), so the dense desktop view never ships a
sub-44px touch target to a phone. The minimum is a named token because it is a
rule, not a taste — it is spent in exactly one `@media (pointer: coarse)` block,
and nothing else in the system may quietly choose a smaller number.

That override lives in `tokens.css` alongside the values it replaces, not in the
component layer. Retuning density for touch is a token change; no component knows
it happened.

## 11. Icons

Hugeicons, stroke weight **1.5**, at 16 / 20 / 24px. The 1.5 stroke matches the
hairline borders; a 2px stroke would out-weigh them. Icons are decorative by
default (`aria-hidden`) — when an icon is the only content of a control it carries
an accessible name.

---

## 12. Table affordances

The table carries nine columns: Visitor, Status, Risk, Visits, Paid clicks,
Click interval, Converted, Cost, and a trailing actions column. Four of them sort.

**Sort arrows appear on hover.** A column header is already a target; a permanent
arrow on all nine is nine pieces of furniture competing with the data. The arrow
fades in when you reach for the column, and the column actually sorting keeps its
arrow visible at all times. The glyph is always an up or down chevron — a
direction, never an ambiguous "sortable" symbol. Direction is also published as
`aria-sort`, because a rotated chevron says nothing to a screen reader.

**No tooltips on column headers.** An earlier version explained each column on
hover. It was dropped: a header that both sorts and explains has two behaviours on
one target, and the explanation appears exactly when the pointer is on its way to
click. Columns that needed a tooltip to be understood were renamed instead —
"Rhythm" became "Click interval", and "Activity" was split into "Visits" and
"Paid clicks". A column name that needs a footnote is the wrong column name.

**No link colour inside a clickable row.** The whole row opens the drawer, so a
blue IP address would promise a different destination than the one it has. Cell
text uses `--text-primary`, `--text-secondary` and `--text-tertiary` only. The two
deliberate exceptions are the converted Yes/No and the saved figure, where the
status colour is carrying a verdict the word already states.

**`Dot` over a chart.** Where a finding fits in a sentence, it is written as a
sentence with a coloured dot beside it — "96 clicks, one every 41s" — rather than
drawn. A custom visualisation in a table cell buys a moment of delight and costs
a permanent legend.

## 13. Showing the risk score

The table shows risk as a slim inline bar with the number to its left. The drawer
shows the same score as a segmented dial. They are different because they answer
different questions: the bar answers *how does this row compare to the one above
it*, the dial answers *how bad is this one, on a scale I can see the ends of*.

**The dial colours the scale, not the value.** Each of the 24 segments takes one
flat sample of a green → amber → brown → red gradient at its own position, and
keeps that colour whether or not it is lit. A full dial therefore reads as a
journey from safe to fatal rather than as a bar that happens to be red today. The
gradient is interpolated in `oklab` between four tokens — `--gauge-band-low`,
`-rising`, `-high`, `-critical` — with `color-mix`, so no colour value reaches the
component. The component emits only a position; the stylesheet decides what that
position looks like. A `@supports` guard falls back to the band's end colour.

**Segments are tapered, not rectangular.** An arc has more room on its outer edge
than its inner one, so constant-width segments leave a gap that fans open towards
the outside — 51% wider at the outer edge in the first version. Sizing each end to
the arc available at its own radius makes the gap identical all the way through.

`--gauge-band-rising` is `amber-500`, which fails contrast as text. That is
deliberate and safe: a gauge segment is decorative fill, and the score it
describes is printed in the middle of the dial in `--text-primary`.

**Native `<select>` was replaced.** The operating system renders its own menu —
different typeface, different highlight colour, different corner radius on every
machine. That is one control the design system cannot reach, sitting in the middle
of a toolbar it is supposed to match. `Select` and `MultiSelect` are listboxes
built on `role="combobox"`, with full keyboard support (arrows, Home / End, Enter,
Escape, Tab) and focus returned to the trigger on close. `MultiSelect` keeps the
list open while toggling, because picking three filters should not cost three
trips back to the trigger.

---

## 14. Rules

1. Components consume semantic tokens. Never a primitive, never a literal.
2. Colour never communicates state alone — pair it with an icon and a label.
3. Every interactive component ships: default, hover, focus-visible, active,
   disabled, loading, error, and empty where applicable.
4. Text contrast ≥ 4.5:1, non-text ≥ 3:1. `--text-tertiary` (2.7:1) is for
   placeholders and disabled text only, never content.
5. Touch targets ≥ 44×44px on coarse pointers.
6. Mobile first. Tables degrade to a stacked card layout, not a horizontal scroll
   of nine columns.
7. One primary (lemon) action per view.

---

## 15. Known gaps

Recorded rather than hidden. Each is asserted by a story, so it cannot be quietly
forgotten.

**The stacked table loses its ARIA semantics.** Below 768px the responsive layout
switches the cells to `display: block` and hides `thead`. That is what makes each
row read as a card — and it also strips the implicit table roles, so assistive
technology on a phone gets a run of labelled text rather than a grid. Restoring it
means explicit `role="row"` / `role="rowgroup"` attributes, which the consumer
writes rather than `Table`; fixing it properly means exporting `Tr`, `TBody` and
`THead` and changing the call site. `Components/Table → Stacked` asserts today's
behaviour so the regression is visible.

**Eight exports the prototype does not use.** `Menu` (superseded by `MultiSelect`),
`InfoTip` (header tooltips were dropped, see §12), `Skeleton` (the prototype ships
with data, so no loading state is reachable), `TableToolbar` and `ToolbarSpacer`
(the filters sit above the card rather than inside it). They are documented and
tested; they are simply not on this screen.

**No `--radius-sm`.** A 16–20px checkbox at 8px radius reads almost circular. The
component pass will either document a `--radius-sm: 4px` exception for controls
under 20px or accept the rounder checkbox. Nothing on this screen forces the
decision yet.
