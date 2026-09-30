# Icon critique rubric

Score the **rendered result** (the `portal icons preview` collage and the audit
report), not your intentions. Score each dimension 0–5. Pass = every dimension ≥ 3
and total ≥ 26/35. Iterate only on the failing dimensions; if two iterations do not
raise a score, simplify the concept (return to Phase 2).

| # | Dimension | 0 | 3 | 5 |
|---|---|---|---|---|
| 1 | **Silhouette** | mushy, ambiguous | readable shape | distinctive, ownable outline |
| 2 | **Small-size legibility** | collapses at 32 px | holds at 32 px | crisp at 16 px (grayscale) |
| 3 | **Concept relevance** | generic / unrelated | clearly tied to product | idea + a genuine second reading |
| 4 | **Distinctiveness** | looks like an AI template | not generic | memorable vs category peers |
| 5 | **Balance & centering** | off-center, drifting | optically centered | deliberate dynamic balance |
| 6 | **Contrast** | accent fades into bg | clean separation | premium contrast, harmonized palette |
| 7 | **Craft / no-tells** | amateur or "AI-logo" tells | clean and professional | studio-grade, timeless |

## Automatic metrics that back each dimension

From `node scripts/audit-icon.mjs` (these are *evidence*, not the score):

- **Transparent, symbol-only**: corners alpha 0 and no full-canvas fill → dimension 7.
- **Optical centering**: glyph bbox center offset from (512, 512); flag > ~4% of the
  canvas → dimensions 5.
- **Safe zone**: rendered content within `safeZone` (iOS) and `glyphScale` (Android)
  without clipping → dimensions 1, 2.
- **Contrast**: WCAG contrast ratio between `PRIMARY` and `background`; target ≥ 3:1
  → dimension 6.
- **Monochrome**: grayscale separability of the mark (usable as Android
  `monochromeImage`) → dimensions 2, 7.
- **Small-size survivability**: coverage at 16/32/64 px should stay stable (not drop
  to near-zero, not saturate to a blob) → dimension 2.
- **Background sync**: `icon-source.json.background` == iOS `.icon` fill ==
  `android.adaptiveIcon.backgroundColor` == `splashBackgroundColor` → dimension 6.

## How to critique in the loop

1. Screenshot the collage (browser tools) or read the PNG.
2. For each dimension, write one sentence of evidence + the score.
3. Name the **single highest-leverage fix** and apply it to the SVG.
4. Re-run `preview.mjs` + `audit-icon.mjs`; re-score.
5. Stop at pass or after ~4 iterations.

## Common failure → fix

| Symptom | Likely cause | Fix |
|---|---|---|
| Icon looks like a rounded tile | background baked into the glyph | remove the full-canvas rect; keep symbol-only |
| Clipped/small on Android, fine on iOS | symbol too large for `glyphScale` | shrink the mark, recenter |
| Vanishes at small sizes | hairline details / low coverage | thicker primitives, one focal point |
| "AI-generated logo" feel | 3D/glow/metal/shadows | flat or softly shaded 2D, matte, no bloom |
| Generic | literal function icon | new metaphor with a second reading |
| Monochrome is a solid block | opaque tile used as the mark | make the background transparent |
| Muddy on light/dark | accent too close to bg or to mid-gray | raise contrast, check grayscale |
