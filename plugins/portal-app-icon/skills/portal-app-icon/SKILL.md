---
name: portal-app-icon
description: Design and install a professional, brand-consistent app icon glyph for an Expo project managed by the Portal CLI, replacing the neutral default. Use when a developer starts a Portal app and wants an elegant icon, or asks to "make an app icon", "replace the default glyph", "design the app icon", or "brand my app". Authors one assets/glyph.svg (symbol, rich-gradient or composed tile), syncs the brand background across iOS/Android/splash, runs portal icons generate/check/preview, and validates with a fast render/audit loop. Vector SVG only (no image API).
compatibility: opencode
---

# Portal App Icon

Turn a short app brief into a **production-ready icon glyph** for a Portal-managed Expo
project, then install it through the Portal icon factory so a single SVG becomes every
per-variant icon and splash asset.

The glyph is authored as **clean SVG by you (the model)** — no image-generation API.
The factory (`portal icons generate`) renders it into the 15 assets (5 files ×
`production` / `preview` / `development`).

> **This skill is a guide, not a rulebook.** The reference quality bar is the
> **Playground** icon — a `composed` SVG with a real second reading. Study
> `references/example-playground.md`; don't copy it. Aim for that *kind* of thinking.

## When to use

- A dev just ran `portal init` and wants to replace the neutral diamond glyph.
- Someone asks for an app icon, logo mark, or brand symbol for an Expo/Portal app.
- An existing icon looks unpolished or "AI generated" and needs a redesign.

Do **not** use this skill for app store screenshots, marketing banners, or web icons.
It is the **app launcher glyph** that feeds `portal icons`.

> **Raster / photoreal icons are out of scope.** If the user wants a rendered,
> gradient-heavy, "AI artwork" icon, they should use the SnapAI-based **app-icon** skill
> instead. This skill stays vector-native to keep Portal's theming/monochrome/variants.

## Preconditions

- The project has `assets/glyph.svg` + `assets/icon-source.json`, or a Portal
  `app.config.ts` (marker `@portal-init`). If the input is missing, run
  `portal setup icons` (or `portal init`) first — never invent the config by hand.
- `portal` is available: prefer `./node_modules/.bin/portal`, otherwise
  `npx --yes @portalcloud-io/cli`. `scripts/detect.mjs` resolves it.

## Pipeline

### Phase 0 — Detect

```bash
node "$SKILL_DIR/scripts/detect.mjs" [projectRoot]
```

Reports `projectRoot`, the resolved `portal` entry, `glyphPath` / `configPath`, the
current `background` / `PRIMARY` / `safeZone`, the app name/slug, the **composition
mode** of the current glyph, the color tokens used, and the three background surfaces.

If the app is not Portal-managed, stop (offer `portal init`). If a **custom** glyph
already exists you will overwrite it — confirm with the user and keep a backup (Phase 3).

### Phase 1 — Brief

Ask only for what you cannot infer. Use `references/brief-template.md` as a **guide**
(not a form). Minimum: what the app does; audience; 3–4 personality adjectives; a style
hint; a palette direction (or let the skill derive one).

### Phase 2 — Concepts (before drawing)

Emit **3–5 directions** shaped like the Playground brief (`brief-template.md`): central
idea + **second reading** + 2–4 primitives + construction (grid, radii, negative-space
channel) + mode + how it reads at 16 px. The concepts should be **different shapes**,
not one idea in different finishes. Let the user pick (or pick the strongest and say
why). Consult `references/concepts-and-styles.md` and `references/example-playground.md`.

**Choose a composition mode** (`references/composition-modes.md`): `symbol` (background
from Portal; theming + monochrome work), `rich-gradient` (rich symbol, transparent bg),
or `composed` (full artwork with its own tile, Playground-style). No default is forced —
pick from the brief and state the tradeoff.

### Phase 3 — Author the glyph

1. **Back up** an existing glyph: copy `assets/glyph.svg` → `assets/glyph.svg.portal.bak`
   (skip if it is still the untouched placeholder template).
2. Write `assets/glyph.svg` (only the SVG — no prose, no markdown fences), following
   `references/svg-authoring-contract.md`.
3. Color: hardcoded hex is fine; use `{{TOKEN}}` only if the icon must respond to the
   palette/variants (any token you use must exist in `icon-source.json.colors`).
4. Patch `assets/icon-source.json`:
   - `background` = the brand background hex (drives the iOS 26 `.icon` fill);
   - `colors.PRIMARY` = the brand accent hex;
   - leave `safeZone`, `badges`, `badge`, `android` as-is unless there is a reason.
5. **Only in `symbol` / `rich-gradient` mode**, sync the background across the three
   surfaces (`detect.mjs` reports them): `android.adaptiveIcon.backgroundColor` in the
   preserved `/* portal:custom-* */` block of `app.config.ts`, `splashBackgroundColor`,
   and `icon-source.json.background`. In `composed` mode this is unnecessary.

### Phase 4 — Render & audit (fast loop)

```bash
node "$SKILL_DIR/scripts/render.mjs" [projectRoot]        # contact sheet, NO factory run
node "$SKILL_DIR/scripts/audit-icon.mjs" [projectRoot]    # measured: mode, centering, contrast...
```

`render.mjs` writes one PNG: the mark at 16/32/64/128/256 px on the app background and
on light, a monochrome pass, and a safe-zone overlay. **Iterate the SVG here** — it does
not run the factory. `audit-icon.mjs` prints a measured report and exits non-zero only on
real defects (missing input, undefined tokens, empty glyph). Fix the SVG, not the tools.

### Phase 5 — Critique loop

Look at the contact sheet (`render.mjs`) and score it against
`references/design-rubric.md`. Iterate only on the weak lines. Cap the loop at ~4
iterations; if it is not converging, go back to Phase 2 and pick a **different shape**.

### Phase 6 — Install (the factory, once)

When the contact sheet looks right:

```bash
node "$SKILL_DIR/scripts/preview.mjs" [projectRoot]       # portal icons generate → check → preview
```

Confirm the collage, then hand off the build commands:

```bash
npx expo prebuild --clean
npx portal build android --profile development   # or `npx expo run:ios` / `run:android`
```

Report: the concept and why; the mode; files written; the audit result; the collage path.

## Guardrails

- **Back up before overwrite.** Never destroy a custom glyph without a `.portal.bak`
  and, if it was custom, explicit confirmation.
- **No badge in the glyph.** `DEV` / `PRE` are added by the factory per variant.
- **Every `{{TOKEN}}` must exist** in `icon-source.json.colors` (the factory throws
  otherwise). Use hardcoded hex if you don't need theming.
- **Never hand-edit `assets/icons/**`.** Always go through `portal icons generate`.
- **Monochrome caveat.** In `composed` mode the tile becomes a solid block as Android
  `monochromeImage` — call this out if themed icons matter.
- **No external image APIs.** SVG authoring is local. For raster/photoreal icons,
  point the user to the SnapAI `app-icon` skill.
- **No secrets** in output. This skill needs none.

## References

- `references/brief-template.md` — the brief (guide) + concept output shape.
- `references/example-playground.md` — the reference quality bar, annotated.
- `references/composition-modes.md` — `symbol` / `rich-gradient` / `composed` + tradeoffs.
- `references/svg-authoring-contract.md` — what the factory requires.
- `references/concepts-and-styles.md` — archetypes, styles, the canonical anti-tells.
- `references/design-rubric.md` — the critique lens + measured evidence.

## Quick command reference

```bash
node "$SKILL_DIR/scripts/detect.mjs" [projectRoot]        # inspect project + current icon state
node "$SKILL_DIR/scripts/render.mjs" [projectRoot]        # fast contact sheet (no factory)
node "$SKILL_DIR/scripts/audit-icon.mjs" [projectRoot]    # measured audit (mode/centering/contrast)
node "$SKILL_DIR/scripts/audit-icon.mjs" [projectRoot] --json
node "$SKILL_DIR/scripts/preview.mjs" [projectRoot]       # factory once: generate → check → preview
```
