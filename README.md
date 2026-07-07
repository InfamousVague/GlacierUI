# Perfect

A token-first React UI kit. Every margin, padding, and control height comes from one shared
scale, so everything lines up by construction. The visual language follows modern Apple design:
generous padding, capsule controls, and translucent glass materials.

## Packages

| Package | What it is |
| --- | --- |
| `@perfect/tokens` | Source of truth: OKLCH 12-step color ramps + semantic layer, glass materials + blur, fluid space scale, modular type scale, radius ramp, elevation, motion tokens, density. TypeScript in, `css/tokens.css` out. |
| `@perfect/motion` | The micro-animation vocabulary as real TS enums (`Motion`, `Speed`, `Ease`, `Spring`) with framer-motion presets (`motionProps`, `springTransition`, `press`, `lift`). |
| `@perfect/react` | React 19 components styled with CSS Modules over semantic tokens only, organized by atomic design. Atoms: Button, IconButton, Input, Checkbox, Radio, Switch, Card, Surface, Text, Heading, Label, Link, Kbd, Pill, Divider. Molecules: Field, Select, SegmentedControl. Organisms: Modal. |
| `@perfect/icons` | Reserved for the icon set. |
| `apps/docs` | Custom Vite docs app: live token galleries, motion playground, per-component documentation with copy-paste examples and props tables, theme + density toggles. |

## Commands

```sh
npm install          # once, at the repo root
npm run gen          # regenerate css/tokens.css after editing token source
npm run dev          # docs app at http://localhost:5199
npm test             # vitest: token math + component behavior + axe checks
npm run test:visual  # playwright screenshot regression (needs: npx playwright install chromium)
```

## Rules that keep it perfect

1. **No raw values in components.** Every color, size, radius, duration comes from a
   `--perfect-*` token. If a value isn't a token, it doesn't ship.
2. **Components consume the semantic layer**, never ramp steps. Themes flip underneath.
3. **Spatial values come off the space scale.** Control heights come from
   `--perfect-control-height-*` so mixed rows always align.
4. **Motion is enum-only.** Pick from `Motion`/`Speed`/`Ease`/`Spring`; never hand-roll a duration.
5. **Edit tokens in TypeScript** (`packages/tokens/src`), then `npm run gen`. Never edit
   `tokens.css` by hand.
6. **Atomic direction only.** Atoms never import from molecules or organisms; shared contracts
   (like the Field context) live in `internal/`.
7. **No aliased imports.** Write `motion`, not `motion as m`; `styles`, not `s`.

## Theming

- `data-theme="light" | "dark"` on `<html>` (defaults to `prefers-color-scheme`)
- `data-density="compact"` for dense UIs
- `--perfect-radius-scale` to sharpen/soften every corner globally
- Accent is the `accent` ramp in `packages/tokens/src/color.ts` — retune once, everything follows.
