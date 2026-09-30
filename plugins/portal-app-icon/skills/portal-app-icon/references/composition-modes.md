# Composition modes

The Portal icon factory ingests **one** `assets/glyph.svg` and scales its opaque
bounding box to the safe zones. What goes *inside* that SVG — a bare symbol or a full
designed tile — is a **design choice**. There is no forced default: pick the mode that
fits the brief and state the tradeoff.

The three modes below are a vocabulary, not a cage. Mixing is fine if the result holds
up in the contact sheet.

---

## `symbol` — the factory-native mark

Transparent background, symbol only. The background comes from **Portal**:
`icon-source.json.background` → the iOS 26 `.icon` fill, `android.adaptiveIcon.backgroundColor`,
and the splash color.

- ✅ Best integration: Liquid Glass on iOS, real **monochrome** for Android themed icons,
  cleanest safe-zone behavior, smallest file.
- ✅ The mark can still be rich: 2–4 shapes, gradients, duotone.
- ⚠️ The background is flat (one color) unless the OS renders the `.icon` glass effect.
- **Use when** the brand mark is the star and you want theming/variants to work.

## `composed` — the full artwork (Playground style)

The glyph includes its own background tile / glow / scene. The Playground icon is
`composed`: a rounded obsidian tile with an ambient glow and the symbol on top.

- ✅ Maximum control and impact; the icon looks identical everywhere; great for a
  distinctive, "designed object" feel.
- ⚠️ **Background surfaces become redundant** — `icon-source.background`, the iOS fill
  and the Android adaptive background are no longer what shows through.
- ⚠️ **Monochrome becomes a solid block** — a baked tile has no transparent silhouette,
  so Android themed icons lose meaning.
- ⚠️ Slightly larger; the tile is scaled by the factory like any other content.
- **Use when** the design *is* the object and theming/monochrome is not a requirement.

## `rich-gradient` — the hybrid

A rich symbol (gradients, layered shapes, an inner nuance) **without** a full tile — the
background stays transparent and comes from Portal.

- ✅ Keeps monochrome + theming + safe-zone behavior of `symbol`.
- ✅ Adds depth/premium feel through gradients and layering.
- ⚠️ Without a background container, gradients have to work against *any* wallpaper.
- **Use when** you want more presence than flat `symbol` but still need theming.

---

## Quick tradeoff

| | `symbol` | `rich-gradient` | `composed` |
|---|---|---|---|
| Transparent background | yes | yes | no |
| Background from Portal | yes | yes | redundant |
| Android monochrome | ✅ real | ✅ real | ⚠️ solid block |
| Theming / variants | ✅ | ✅ | limited |
| Visual impact | medium | high | highest |
| Config surfaces to sync | all 3 | all 3 | not needed |

## Same in every mode

- `1024×1024`, content centered, readable at 16 px and in grayscale.
- Authored so it sits comfortably within the iOS `safeZone` (~0.66) and Android
  `glyphScale` (~0.45) — the factory only shrinks.
- No `DEV` / `PRE` badge in the glyph: the factory adds those per variant.
- Verify with `render.mjs` (fast) and `audit-icon.mjs` (numbers) before the single
  `preview.mjs` factory run.
