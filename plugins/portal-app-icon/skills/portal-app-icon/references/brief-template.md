# App Icon Brief — guide

> A **guide, not a form**. Its job is to force a few real decisions before drawing.
> Skip fields you can infer; invent the shape that fits the app. The reference quality
> bar is the Playground icon — see `example-playground.md` and
> `../../../../../docs/examples/playground/`.

Fill it in your head, or in 6–8 lines of prose. Do not turn it into a bureaucracy.

---

## 1. Product (infer first, ask only what is missing)

- **Name**:
- **One-liner** — "an app that helps ___ do ___":
- **Audience**:
- **Category**: fintech · health · productivity · dev tool · social · games · …

## 2. Idea & second reading (the core)

- **Central idea** — one sentence, the *concept*, not the drawing.
  e.g. *"A space where you can experiment."*
- **Second reading** — what the geometry *additionally* suggests, never literal.
  e.g. *"A quiet 'P' for those who look."*

If you can't state both, the mark will be generic. This is the highest-leverage step.

## 3. Personality (3–4 adjectives, through geometry)

Premium · playful · elegant · technical · trustworthy · calm · bold · minimalist · …

Achieve them through **proportion, rhythm and interaction between shapes**, never
through literal illustration or childish elements. See `concepts-and-styles.md`.

## 4. Composition (decide before drawing)

- **Primitives**: 2–4 primary shapes (fewer is stronger).
- **Construction**: grid; **concentric radii**; a *continuous* negative-space channel.
- **Proportions**: give real numbers when you commit (radii, thickness, spacing) —
  exact numbers are what make a mark feel built.
- **Mode** (see `composition-modes.md`): `symbol` (background supplied by Portal) or
  `composed` (the artwork includes its own tile/background). Choose from the brief and
  state the tradeoff. No default is forced.
- **Silhouette**: balanced but slightly dynamic; must read with no color and at 16 px.

## 5. Color

- **Direction**: one family (e.g. teal/cyan/mint) + a deep tone. One mood, not a rainbow.
- **Rendering**: hardcoded hex is fine (like Playground). Use `{{PRIMARY}}`-style tokens
  **only when the icon should respond to the app palette / variants**.

## 6. Restrictions (keep these; they prevent generic output)

- No text, letters, initials, monograms or taglines.
- No literal app-function icons (`</>`, brackets, terminals, cursors, chips, circuits,
  robots, brains, charts, lightbulbs, rockets, 3D cubes, AI sparkles).
- No literal representation of the product.
- No "AI-generated logo" tells: no 3D render, no chrome/metal, no dramatic shadows, no
  heavy glow/bloom, no lens flare, no mockup, no texture noise.
- Must read at **16 px**, in **grayscale**, and on light and dark.

> A rounded-square tile/plate behind the subject is **allowed** in `composed` mode (see
> `composition-modes.md`) and **not** in `symbol` mode.

## 7. Output

- SVG, `viewBox="0 0 1024 1024"`, centered, optimized (minimal nodes/decimals).
- Symbol/artwork sized for the iOS safe zone (~0.66) and Android glyph scale (~0.45).
  The factory only shrinks — don't author edge-to-edge.

---

## Concepts — output shape (3–5 before drawing)

Emit directions in roughly this shape, then let the user pick (or pick the strongest if
they said "you decide", stating why):

```
### Concept N — short_name
Idea:            the concept in one line
Second reading:  what the geometry additionally suggests
Geometry:        2–4 primitives, grid, radii, negative-space channel
Mode:            symbol | composed
Small-size:      why it reads at 16 px and in monochrome
Risks:           what could make it generic or unreadable
```

Draw **only the chosen concept**. It's normal to align the finish (radii, spacing)
after picking — but the concepts should be genuinely different shapes, not one idea in
different finishes.
