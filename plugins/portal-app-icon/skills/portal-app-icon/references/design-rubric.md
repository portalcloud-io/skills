# Icon critique — "what makes a symbol great"

This is a **lens**, not a score machine. Judge the *rendered* result (the `render.mjs`
contact sheet, and `audit-icon.mjs` for numbers), never your intentions.

The reference: the Playground icon (`example-playground.md`) — a 5 on every line.

For each line: write **one sentence of evidence**, then decide whether it is a problem
worth a change. Iterate only on real problems. If two iterations don't improve the
weakest line, go back to concepts (a different *shape*, not a different finish).

| # | Line | Weak (0) | Solid (3) | Reference (5) |
|---|---|---|---|---|
| 1 | **Idea** | generic / none | tied to the product | one sentence + a genuine second reading |
| 2 | **Silhouette** | mushy, ambiguous | readable shape | distinctive, ownable outline |
| 3 | **Construction** | eyeballed, accidental gaps | on a grid, concentric radii | exact proportions, a continuous negative-space channel |
| 4 | **Small-size** | collapses by 32 px | holds at 32 px | crisp at 16 px, in grayscale |
| 5 | **Craft / no-tells** | amateur or "AI-logo" | clean and professional | studio-grade, timeless |
| 6 | **Color** | muddy / rainbow | clean separation | one family + deep tone, premium |
| 7 | **Distinctiveness** | looks like an AI template | not generic | memorable vs category peers |

## Evidence from the tools (numbers, not vibes)

`node scripts/render.mjs` — one fast contact sheet, no factory run:
- the mark at 16/32/64/128/256 px on the app background and on light;
- a monochrome pass (Android themed-icon preview);
- a safe-zone overlay (blue = iOS `safeZone`, dashed amber = Android `glyphScale`).

`node scripts/audit-icon.mjs` — measured report:
- **Composition mode** (`symbol` / `composed`) and coverage.
- **Optical centering**: bbox center offset from the canvas center.
- **Safe zone**: rendered extent vs `safeZone` / `glyphScale` (no clipping).
- **Contrast**: WCAG ratio between `PRIMARY` and `background` (target ≥ 3:1).
- **Small-size**: for `symbol`, alpha coverage at 16/64 px; for `composed`, surviving
  tonal range at 16 px.
- **Monochrome**: for `composed`, a warning that the tile becomes a solid block.
- **Background surfaces**: sync across icon-source / iOS fill / Android / splash.

> Only `{{TOKEN}}` colors are substituted before measuring (same as the factory). A
> mark colored via `stroke="{{PRIMARY}}"` is measured correctly.

## Common failure → fix

| Symptom | Likely cause | Fix |
|---|---|---|
| Feels "AI-generated" | 3D/glow/metal/heavy shadow | flat or softly shaded 2D, matte |
| Generic | literal function icon | a new metaphor with a second reading |
| Eyeballed / wobbly | no grid, no concentric radii | commit to real numbers, rebuild on a grid |
| Vanishes at 16 px | hairline details / low coverage | thicker primitives, one focal point |
| Clipped/small on Android | mark too large for `glyphScale` | shrink the mark, keep breathing room |
| Monochrome is a solid block | `composed` tile used as the mark | switch to `symbol` mode for theming |
| Muddy on light/dark | accent too close to bg or mid-gray | raise contrast, check grayscale |
