# Reference: the Playground icon

> **This is a guide, not a template.** Do not copy this symbol, its coordinates, or
> its concept. Study *why* it works and apply the same kind of thinking to a different
> app. The full brief and SVG live in `docs/examples/playground/`.

The Playground icon is the quality bar this skill aims for. It reached that level with
**vector SVG** — no image model — which is why the whole skill is viable.

## What made it work (transferable patterns)

1. **A central idea in one sentence.**
   *"Un espacio donde podés experimentar."* Not a list of features, not "a playground
   with a slide". If you cannot say the idea in one line, the symbol is not ready.

2. **A second reading that is never literal.**
   The geometry quietly suggests the letter **P**, but the brief forbids drawing a "P".
   The mark works as an abstract space *and* as a monogram to those who look. This is
   the single biggest difference between a plain mark and an ownable one.

3. **Few primitives, intentionally composed.**
   Three shapes — a vertical stem, a C-frame loop, a floating nucleus — interacting on
   a grid with a **continuous 40 px negative-space channel** (a designed channel, not
   accidental gaps).

4. **Concrete proportions and concentric radii.**
   Outer radii 168, thickness 120, inner radii 48. Exact numbers — not eyeballed — are
   what make a mark feel *constructed* and premium rather than "generated".

5. **Personality from geometry, not illustration.**
   Premium/playful/elegant/developer-centric come from proportion, rhythm and the
   tension between modules. Nothing is a literal coding icon.

6. **Color with direction.**
   A tight teal/cyan/mint family on deep obsidian, plus a subtle radial glow for depth.
   One palette, one mood — not a rainbow.

7. **Silhouette first.**
   It reads without the name, works in black and white, and survives at 16 px.

## The brief pattern (reusable shape)

Use this shape for any app — fill the *thinking*, not the words:

```
Idea (1 sentence):     the abstract concept
Second reading:        what the geometry additionally suggests (never literal)
Primitives (2–4):      the shapes and how they interact
Construction:          grid, radii, negative-space channel, proportions
Personality:           3–4 adjectives, achieved through geometry
Restrictions:          what to avoid (see concepts-and-styles.md)
Color:                 one family + a deep tone; works in monochrome
```

## Composition mode

Playground is a **`composed`** glyph: the final artwork includes its own rounded
background tile and glow. That is legitimate and high-impact; it is not the only right
answer. See `composition-modes.md` for the tradeoffs (background surfaces become
redundant; Android monochrome becomes a filled tile). Let the brief decide.
