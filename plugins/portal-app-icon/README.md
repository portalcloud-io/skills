# Portal App Icon Plugin

Design and install a professional, brand-consistent app icon for an Expo project
managed by the [Portal CLI](https://www.npmjs.com/package/@portalcloud-io/cli),
replacing the neutral default glyph.

## What this plugin does

- Turns a short app brief into a clean, **hand-authored SVG** glyph (no image API).
- Writes `assets/glyph.svg` and patches `assets/icon-source.json`.
- Syncs the brand background across iOS 26 `.icon` fill, Android adaptive
  background, and the splash screen.
- Runs `portal icons generate/check/preview` so one design becomes the 15
  per-variant assets (`production` / `preview` / `development`).
- Audits geometry, centering, safe zones, contrast, monochrome readability, and
  small-size legibility, then iterates on a visual rubric.

## Requirements

- A Portal-managed Expo project (`assets/glyph.svg` + `assets/icon-source.json`).
- The Portal CLI (`@portalcloud-io/cli`) available locally or via `npx`.
- `sharp` resolvable from the project or the Portal CLI (it ships with the CLI).

## When to use

- You just ran `portal init` and want to replace the default diamond glyph.
- You want an elegant, on-brand launcher icon with proper iOS 26 / Android adaptive
  support.
- An existing icon looks generic or "AI generated" and needs a redesign.

## Usage

Install from this marketplace, then ask your agent in natural language:

```text
Create an app icon for my Portal app. It is a calm habit tracker; make it feel
premium and geometric. Show me a few concepts, then install the best one.
```

The skill drives the whole flow: brief → concepts → SVG → `portal icons
generate/check/preview` → audit → critique.

## Structure

```
skills/portal-app-icon/
  SKILL.md
  references/{brief-template, svg-authoring-contract, concepts-and-styles, design-rubric}.md
  scripts/{detect, audit-icon, preview}.mjs
```

## License

MIT
