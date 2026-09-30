# `assets/glyph.svg` authoring contract

This is the exact contract the Portal icon factory expects. It was derived from the
CLI source (`packages/cli/src/icons/*`) and verified against generated output. Follow
it literally.

## 1. What the factory does with your SVG

```
assets/glyph.svg ──► normalizeGlyph ──► composeFull ──► writeVariantAssets
                    (bbox + safeZone)   (+ badge)       (5 files × 3 variants)
```

- `normalizeGlyph` rasterizes the SVG (sharp/librsvg), finds the bounding box of
  **non-transparent pixels**, and centers it on a transparent 1024×1024 canvas. It
  **only shrinks** (never upscales) so the content fits `safeZone` of the canvas.
- `composeFull` composites the normalized glyph on a **transparent** canvas and adds
  the per-variant badge. It does **not** paint `icon-source.json.background`.
- Therefore the PNG background is whatever your SVG contains. For the app-launcher
  glyph the correct answer is **transparent, symbol only** — the background is
  supplied separately (iOS `.icon` fill, Android `adaptiveIcon.backgroundColor`,
  splash color).

## 2. Hard rules

1. **Symbol only / transparent background.** No full-canvas `<rect>` background, no
   card, plate, rounded-square tile, shadow plate, or badge.
2. **Root element**
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
   ```
   `viewBox` is always `0 0 1024 1024`.
3. **No text.** No `<text>`, `<tspan>`, letters, monograms, watermarks.
4. **Accent color only via the `{{PRIMARY}}` token.** The factory replaces the token
   with `colors.PRIMARY` from `assets/icon-source.json`. If you need more than one
   color, add each token to `icon-source.json.colors` first (keep it to `PRIMARY`
   in the default flow — one accent is stronger).
5. **Monochrome-safe.** The same `android-icon.png` is reused as Android's
   `monochromeImage` for themed icons, tinted by the system. The mark must read as a
   solid silhouette from alpha alone. Do not make meaning depend on hue; avoid
   hairline details that vanish — keep strokes/detail ≥ ~28 px at this scale.
6. **Small-size legibility.** Must read at 16–32 px and in grayscale. One focal
   point; strong silhouette; generous negative space.
7. **Optical sizing.** Design the mark to sit well within the iOS safe zone
   (~0.66 of the canvas) and Android glyph scale (~0.45). The factory only shrinks,
   so don't author the symbol edge-to-edge.
8. **Optical centering.** Geometric bbox should be centered around (512, 512).
   Compensate for asymmetric shapes so the *optical* center (not just the math
   center) looks centered. The auditor measures the offset.
9. **No badge.** `DEV` / `PRE` are added by the factory; never bake them in.
10. **Valid, self-contained SVG.** No `<image>`, no external URLs, no `<script>`, no
    CSS `@import`, no references to `node_modules`. Inline presentation attributes are
    preferred over `<style>` blocks for maximum librsvg reliability.

## 3. Allowed building blocks

- Elements: `<g>`, `<path>`, `<rect>`, `<circle>`, `<ellipse>`, `<polygon>`,
  `<line>`, `<defs>`, `<linearGradient>`, `<radialGradient>`, `<stop>`.
- Attributes: `fill`, `fill-opacity`, `stroke`, `stroke-width`, `stroke-linecap`,
  `stroke-linejoin`, `opacity`, `transform`, `rx`/`ry`.
- Prefer exact geometric curves (`A`, `Q`, `C`) and concentric radii.

Avoid `<filter>` effects (blur/glow) — they render inconsistently and fight the
"no AI-look" requirement. Gradients *within* the mark are allowed and encouraged for
premium depth, but the mark must still work in monochrome.

## 4. Color & background synchronization

`icon-source.json.background` drives the iOS 26 `.icon` fill. The skill also syncs
`android.adaptiveIcon.backgroundColor` and `splashBackgroundColor` to the same hex so
all three surfaces match. Accent (`PRIMARY`) must keep ≥ 3:1 contrast with that
background (the auditor computes it).

## 5. Reference: a valid glyph (structure)

Transparent, symbol-only, one accent token, centered, monochrome-safe:

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

(A background rect, a `<text>`, or a full-bleed tile would all violate this
contract.)

## 6. Verify

```bash
node scripts/audit-icon.mjs [projectRoot]
```

The auditor flags: non-transparent corners, off-center bbox, safe-zone violations,
low contrast vs background, weak monochrome separability, small-size collapse, and
background mismatch across the three surfaces.
