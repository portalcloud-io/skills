# Portal App Icon

Design and install a professional, brand-consistent **app icon** for an Expo project
managed by the [Portal CLI](https://www.npmjs.com/package/@portalcloud-io/cli),
replacing the neutral default glyph.

![Portal app icon preview](../../docs/preview.png)

## What it does

- Turns a short app brief into a **hand-authored SVG** glyph — vector, no image API.
- Supports three **composition modes** — `symbol`, `rich-gradient`, `composed` — and
  lets the brief decide (no forced default).
- Writes `assets/glyph.svg` and patches `assets/icon-source.json`.
- In symbol modes, syncs the brand background across the iOS 26 `.icon` fill, the
  Android adaptive background and the splash screen.
- Runs the Portal icon factory so **one design becomes 15 per-variant assets**
  (`production` / `preview` / `development`).
- Validates with a **fast render/audit loop**: a contact sheet (`render.mjs`, no factory
  run) plus a measured report (geometry, centering, contrast, monochrome, safe zones).

## Reference quality bar

The **Playground** icon is the standard this skill aims for — a `composed` SVG with a
real second reading and exact geometry. See
[`docs/examples/playground/`](../../docs/examples/playground/).

## Install

```bash
npx skills add https://github.com/portalcloud-io/skills --skill portal-app-icon
```

## When to use

- You just ran `portal init` and want to replace the default diamond glyph.
- You need an elegant launcher icon with proper iOS 26 and Android adaptive support.
- An existing icon looks generic or "AI generated" and needs a redesign.

**Not for raster/photoreal icons** — for those, use the SnapAI-based `app-icon` skill.
This skill stays vector-native to keep Portal's theming, monochrome and variants working.

## Usage

```text
Create an app icon for my Portal app. It is a calm habit tracker; make it feel
premium and geometric. Show me a few concepts, then install the best one.
```

The skill drives the whole flow:

```text
detect → brief → concepts → assets/glyph.svg → render/audit (fast) → portal icons generate → deliver
```

## Requirements

- A Portal-managed Expo project (`assets/glyph.svg` + `assets/icon-source.json`).
- The Portal CLI (`@portalcloud-io/cli`) available locally or via `npx`.
- `sharp` resolvable from the project, its `expo`, or the Portal CLI (ships with them).

## Structure

```text
skills/portal-app-icon/
  SKILL.md
  references/
    brief-template.md · example-playground.md · composition-modes.md
    svg-authoring-contract.md · concepts-and-styles.md · design-rubric.md
  scripts/
    detect.mjs · render.mjs · audit-icon.mjs · preview.mjs
    lib/ (project · colors · raster)
```

## License

[Apache-2.0](../../LICENSE)
