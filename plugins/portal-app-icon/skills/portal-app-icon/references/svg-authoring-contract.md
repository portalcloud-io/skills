# `assets/glyph.svg` — authoring contract

What the Portal factory actually requires, and what it leaves to you. Derived from the
CLI source (`packages/cli/src/icons/*`) and verified against generated output.

> **This is a contract for what the factory needs — not a style rulebook.** The look of
> the mark (flat, rich, or a full composed tile) is your call. See `composition-modes.md`.

## 1. What the factory does with your SVG

```
assets/glyph.svg ──► substituteColors ──► normalizeGlyph ──► composeFull ──► writeVariantAssets
                      ({{TOKEN}} → hex)   (bbox + safeZone)   (+ badge)       (5 files × 3 variants)
```

- `substituteColors` replaces each `{{TOKEN}}` with `icon-source.json.colors[TOKEN]`
  **before** rasterizing. It throws if a token is not defined — so any token you use
  must exist in `colors`.
- `normalizeGlyph` rasterizes the SVG (sharp/librsvg), finds the bounding box of the
  **non-transparent pixels** and centers it on a transparent 1024×1024 canvas. It
  **only shrinks** (never upscales) to fit `safeZone`.
- `composeFull` adds the per-variant badge. It does **not** paint
  `icon-source.json.background` into the PNG.

## 2. What the factory requires (non-negotiable)

1. **Root element** with the canvas:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
   ```
   `viewBox` is `0 0 1024 1024`.
2. **Valid, self-contained SVG.** No `<script>`, no external URLs, no `@import`, no
   references to `node_modules`. Inline presentation attributes are more reliable under
   librsvg than `<style>` blocks.
3. **Every `{{TOKEN}}` you use must exist** in `icon-source.json.colors`. Throw-free:
   if you don't want tokens, use hardcoded hex.
4. **No badge.** `DEV` / `PRE` are added by the factory; never bake them in.
5. **Visible content.** The glyph must have opaque pixels (an all-transparent SVG fails
   `normalizeGlyph`).

That's it. Everything else is design.

## 3. Design choices (yours to make)

**Composition mode** (`composition-modes.md`):
- `symbol` — transparent, symbol only; the background comes from Portal.
- `composed` — the artwork includes its own tile/background (Playground style); the
  Portal background surfaces become redundant.
- `rich-gradient` — rich symbol, transparent background.

**Background / tile.** A full-canvas `<rect>` (rounded or not) is **allowed** in
`composed` mode and forbidden in `symbol` mode. A *subtle* radial ambient glow inside a
composed background is fine; heavy bloom/bloom-lighting is an "AI-logo" tell.

**Color.** Hardcoded hex is perfectly valid (the Playground icon does this). Use
`{{TOKEN}}` **only when the icon must respond to the app palette or variants** — e.g.
`{{PRIMARY}}` for a single brand accent. Extra tokens (e.g. `{{PRIMARY_DEEP}}`) work if
you add them to `icon-source.json.colors`.

**Elements.** `<g> <path> <rect> <circle> <ellipse> <polygon> <line> <defs>
<linearGradient> <radialGradient> <stop>`. Prefer exact geometry (`A`, `Q`, `C`,
concentric radii). `<image>` (embedded raster) is discouraged — monochrome then derives
from alpha only and the file balloons.

**Effects.** Soft gradients = good. `<filter>` (blur/glow/grain) renders inconsistently
and usually reads as an AI tell — avoid.

## 4. Sizing & legibility

- Content sized for the iOS `safeZone` (~0.66) and Android `glyphScale` (~0.45). The
  factory only shrinks — don't author edge-to-edge.
- Must read at **16 px**, in **grayscale**, and on light and dark.
- Keep one focal point; when in doubt, fewer shapes and more negative space.

## 5. Color & background synchronization (only matters in symbol/rich-gradient)

In `symbol` / `rich-gradient` mode the background is supplied by Portal, so sync the
three surfaces to the same hex:
- `icon-source.json.background` (drives the iOS `.icon` fill),
- `android.adaptiveIcon.backgroundColor` (in the preserved `portal:custom` block),
- `splashBackgroundColor`.

Accent (`PRIMARY`) should keep ≥ 3:1 contrast with that background. In `composed` mode
these surfaces are redundant — the tile already carries the background.

## 6. A valid symbol-mode glyph (structure reference)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{{PRIMARY}}" stop-opacity="1"/>
      <stop offset="100%" stop-color="{{PRIMARY}}" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <g fill="url(#accent)">
    <!-- 2–4 primitives, concentric radii, explicit negative space -->
    <rect x="300" y="300" width="180" height="424" rx="90"/>
    <path d="M 520 300 L 660 300 A 150 150 0 0 1 810 450 L 810 524 A 150 150 0 0 1 660 674 L 520 674 L 520 560 L 640 560 A 36 36 0 0 0 676 524 L 676 450 A 36 36 0 0 0 640 414 L 520 414 Z"/>
    <circle cx="620" cy="512" r="70"/>
  </g>
</svg>
```

For a **composed** reference see `../../../../../docs/examples/playground/icon.svg`.

## 7. Verify

```bash
node scripts/render.mjs [projectRoot]        # fast contact sheet, no factory run
node scripts/audit-icon.mjs [projectRoot]    # measured: mode, centering, contrast, ...
node scripts/preview.mjs [projectRoot]       # the factory: generate → check → preview
```

Iterate with `render.mjs`; run the factory once at the end.
