---
name: portal-app-icon
description: Design and install a professional, brand-consistent app icon for an Expo project managed by the Portal CLI, replacing the neutral default glyph. Use when a developer starts a Portal app and wants an elegant icon, or asks to "make an app icon", "replace the default glyph", "design the app icon", or "brand my app". Produces a single assets/glyph.svg, syncs the brand background across iOS/Android/splash, runs portal icons generate/check/preview, and validates the result with an automated audit plus a visual critique loop.
compatibility: opencode
---

# Portal App Icon

Turn a short app brief into a **production-ready icon glyph** for a Portal-managed
Expo project, then install it through the Portal icon factory so a single SVG
becomes every per-variant icon and splash asset.

The icon is authored as **clean SVG by you (the model)** — no image-generation API
and no external service. Portal's factory (`portal icons generate`) renders the SVG
into the 15 assets (5 files × `production` / `preview` / `development`). Your job is
to design one excellent symbol and drive the factory.

## When to use

- A dev just ran `portal init` and wants to replace the neutral diamond glyph.
- Someone asks for an app icon, logo mark, or brand symbol for an Expo/Portal app.
- A project has an icon that looks unpolished or "AI generated" and needs a redesign.

Do **not** use this skill for: app store screenshots, marketing banners, or
launch/web icons. It is specifically the **app launcher glyph** that feeds
`portal icons`.

## Preconditions

The skill drives the Portal toolchain. Before Phase 0, confirm:

- The project has `assets/glyph.svg` + `assets/icon-source.json`, or a Portal
  `app.config.ts` (marker `@portal-init`). If the icon input is missing, run
  `portal setup icons` (or `portal init`) first — never invent the config by hand.
- `portal` is available: prefer `./node_modules/.bin/portal`, otherwise
  `npx --yes @portalcloud-io/cli`. The helper `scripts/detect.mjs` resolves this.

> The Portal factory is the source of truth for the input contract. Read
> `references/svg-authoring-contract.md` before writing any SVG.

## Pipeline

### Phase 0 — Detect

Run the detector and read its JSON (run helper scripts from this skill's directory;
`SKILL_DIR` below is the absolute path of the folder containing this `SKILL.md`):

```bash
node "$SKILL_DIR/scripts/detect.mjs" [projectRoot]
```

It reports: `projectRoot`, resolved `portal` entry, `glyphPath`, `configPath`,
`hasGlyph`, `hasIconSource`, the current `background` / `PRIMARY` / `safeZone`, the
app `name`/`slug`, and the three background surfaces found in `app.config.ts`.

If the project is not Portal-managed, stop and tell the user (offer `portal init`).
If a **custom** glyph already exists, you will overwrite it — confirm with the user
first and always keep a backup (Phase 3).

### Phase 1 — Brief

Ask only for what you cannot infer from the project (name/purpose are often in
`package.json` / `app.config.ts`). Use sensible defaults so a dev can answer with
"you decide". Minimum inputs:

- What the app does in one sentence.
- Audience (who uses it).
- 3–5 brand adjectives (e.g. premium, calm, playful, technical, trustworthy).
- Style direction (a preset name or free text — see `concepts-and-styles.md`).
- Palette (or let the skill derive one from the product category).

Use `references/brief-template.md` as the structure. Fill it, then continue.

### Phase 2 — Concepts (required before drawing)

Emit **3–5 named concept directions**. Each must state, in a sentence or two:

- the **central metaphor** (an object or pure form — not a literal app function);
- the **second reading** (what the geometry suggests conceptually);
- rough **geometry** (shapes, grid, negative space);
- why it reads **at 16 px and in monochrome**.

Ask the user to pick one (or auto-pick the strongest if they said "you decide",
stating the rationale). Only then draw. Consult `references/concepts-and-styles.md`
for the archetype + style taxonomy harvested from battle-tested prompt systems.

### Phase 3 — Author the glyph

1. **Back up** an existing glyph: copy `assets/glyph.svg` →
   `assets/glyph.svg.portal.bak` (skip if the file is still the untouched
   placeholder template).
2. Write `assets/glyph.svg` (only the SVG — no prose, no markdown fences).
3. Patch `assets/icon-source.json`:
   - `background` = the brand background hex (drives the iOS 26 `.icon` fill);
   - `colors.PRIMARY` = the brand accent hex;
   - leave `safeZone`, `badges`, `badge`, `android` as-is unless there is a reason.
4. **Sync the background across the three surfaces** (Phase 0 reports their
   current values):
   - `android.adaptiveIcon.backgroundColor` → write it in the **preserved
     `/* portal:custom-start */ … /* portal:custom-end */` block** of
     `app.config.ts` (custom config wins over the base and survives
     re-initialization);
   - `splashBackgroundColor` → the option passed to `createVariantConfig(...)`;
   - `icon-source.json.background` (above).
   Keep edits minimal and idempotent; never touch `assets/icons/**` by hand.

The SVG must follow `references/svg-authoring-contract.md` exactly (transparent
background / symbol-only, `{{PRIMARY}}` tokens, no text, monochrome-safe, no badges).

### Phase 4 — Generate & audit

```bash
node "$SKILL_DIR/scripts/preview.mjs" [projectRoot]      # generate → check → preview
node "$SKILL_DIR/scripts/audit-icon.mjs" [projectRoot]   # geometry, contrast, monochrome, bg sync
```

`preview.mjs` prints the collage path. `audit-icon.mjs` prints a report with a
pass/fail list and exits non-zero when a critical check fails. Fix the SVG (not the
auditor) and re-run until it passes.

### Phase 5 — Visual critique loop

Look at the generated collage (screenshot it with your browser tools, or open the
PNG) and score it against `references/design-rubric.md`. Iterate the SVG for the
failing dimensions only. Cap the loop at ~4 iterations; if it is not converging,
step back to Phase 2 and pick a simpler concept.

### Phase 6 — Deliver

Report: the concept chosen and why; files written (`assets/glyph.svg`,
`assets/icon-source.json`, `app.config.ts`); the audit result; the preview path.
Then hand off the build commands:

```bash
npx expo prebuild --clean
npx portal build android --profile development   # or `npx expo run:ios` / `run:android`
```

## Guardrails

- **Symbol-only, transparent background.** The factory composites on a transparent
  canvas and never paints `icon-source.json.background` into the PNG. The background
  is supplied by the iOS `.icon` fill / Android adaptive background / splash color.
  Do **not** bake a full-canvas background rect into the glyph.
- **No badges in the glyph.** `DEV` / `PRE` are added by the factory per variant.
- **Monochrome matters.** `android-icon.png` is reused as `monochromeImage` (Android
  13+ themed icons). The symbol must read as a solid silhouette.
- **Never hand-edit `assets/icons/**`.** Always go through `portal icons generate`.
- **Back up before overwrite.** Never destroy a user's custom glyph without a
  `.portal.bak` and, if it was custom, an explicit confirmation.
- **No external image APIs** in the default flow. SVG authoring is local.
- **No secrets** in output. This skill needs none.

## References

- `references/brief-template.md` — the design brief + concept output format.
- `references/svg-authoring-contract.md` — the hard rules for `glyph.svg`.
- `references/concepts-and-styles.md` — archetypes, style presets, anti-failure rules.
- `references/design-rubric.md` — the critique scoring rubric.

## Quick command reference

```bash
node "$SKILL_DIR/scripts/detect.mjs" [projectRoot]        # inspect project + current icon state
node "$SKILL_DIR/scripts/preview.mjs" [projectRoot]       # portal icons generate/check/preview
node "$SKILL_DIR/scripts/audit-icon.mjs" [projectRoot]    # geometry/contrast/monochrome/bg-sync audit
node "$SKILL_DIR/scripts/audit-icon.mjs" [projectRoot] --json
```
