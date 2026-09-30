# App Icon Brief — template

Fill this before drawing anything. Keep it short; the goal is a decision, not an essay.
Adapted from the brief that produced the Playground icon (L-Wallet), which is the
reference quality bar.

---

## 1. Product

- **Name**: {{APP_NAME}}
- **One-liner** ("X helps Y do Z"): {{ONE_LINER}}
- **Audience**: {{AUDIENCE}}
- **Category**: {{fintech | health | productivity | dev tool | social | games | …}}

## 2. Positioning & personality

Pick 3–5. Personality must come from **geometry and proportion**, never from literal
illustration or childish elements.

- [ ] Premium / refined
- [ ] Playful / dynamic
- [ ] Elegant / minimal
- [ ] Technical / developer-centric
- [ ] Trustworthy / secure
- [ ] Calm / wellness
- [ ] Energetic / bold
- Other: {{…}}

## 3. Central concept

> One sentence: the *idea*, not the drawing. e.g. "An open laboratory where parts
> combine and evolve."

- **Central idea**: {{CENTRAL_IDEA}}
- **Second reading** (what the geometry suggests conceptually, never literal):
  {{SECOND_READING}}

## 4. Geometry & structure (decide before drawing)

- **Primitive count**: 2–4 primary shapes (fewer is better).
- **Construction**: grid-based; concentric radii where possible; explicit negative
  space (a continuous channel, not accidental gaps).
- **Silhouette**: balanced but slightly dynamic; must read with no color.
- **Optical size**: symbol occupies a comfortable fraction of the canvas, sized for
  the iOS safe zone (~0.66) and Android glyph scale (~0.45). Do not rely on the
  factory upscaling — it only shrinks.

## 5. Color

- **Background**: {{#0A0F14-style deep tone}}
- **Accent family**: {{e.g. teal / cyan / mint}} → `colors.PRIMARY` token.
- Accent must keep ≥ 3:1 contrast with the background (see the auditor).

## 6. Absolute restrictions (non-negotiable)

- **No** text, letters, initials, monograms, or taglines in the symbol.
- **No** literal app-function icons: no `</>`, brackets, terminals, cursors, chips,
  circuits, robots, brains, charts, lightbulbs, rockets, 3D cubes, AI stars/sparkles.
- **No** literal representation of the product category (no literal piggy banks,
  hearts-as-organs, etc.).
- **No** "AI-generated logo" aesthetic: no 3D renders, no metallic/chrome, no
  dramatic shadows, no glow/bloom, no lens flare, no mockups, no texture noise.
- **No** rounded-square tile / card / badge / outer plate behind the subject.
- Works on both light and dark wallpapers and in **monochrome**.

## 7. Output format

- SVG, `viewBox="0 0 1024 1024"`, centered, transparent background (symbol only).
- Optimized: no redundant nodes, minimal decimals, inline styles.
- Accent color expressed as the `{{PRIMARY}}` token (resolved from
  `assets/icon-source.json`).

---

## Concept directions — required output format

Before drawing, output **3–5** directions in this shape and ask the user to pick:

```
### Concept N — {{short_name}}
Metaphor: {{the idea in one line}}
Second reading: {{what the geometry additionally suggests}}
Geometry: {{2–4 primitives, grid, radii, negative-space channel}}
Small-size: {{why it reads at 16 px and in monochrome}}
Risks: {{what could make it generic / unreadable}}
```

Then draw only the chosen concept. If the user delegates the choice, pick the
direction with the strongest silhouette + clearest second reading and say why.
