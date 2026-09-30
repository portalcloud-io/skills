# Concepts & styles

Reusable design intelligence for the icon brief. Harvested and adapted from the
SnapAI prompt system (archetypes, style presets, anti-failure constraints) and the
Playground/L-Wallet brief (second reading, abstract geometry).

## 1. Choose exactly one archetype

Decide the archetype **before** drawing. Never default to a mascot.

| Archetype | Use for | Shape language |
|---|---|---|
| `object_icon` | A single symbolic object, no face | finance, productivity, utilities, dev tools, dashboards, system apps |
| `abstract_form_icon` | Pure form/metaphor, no literal object/face | AI tools, design tools, analytics, experimental products |
| `hybrid_icon` | An object with subtle life cues (no face) | finance+friendly, health, lifestyle |
| `character_icon` | A friendly character **with a face** | kids, games, beginner education, wellness, fun social — never the default |

## 2. Anti-failure rules (always on)

- Context: a standalone symbol, **not** a UI mockup or device chrome.
- No device frame, no card stuck on a card, no badge/chip chrome, no mockup.
- A rounded-square tile/plate behind the subject is **allowed in `composed` mode**
  (like the Playground icon) and **forbidden in `symbol` mode**. See
  `composition-modes.md`. Either way: no fake shadow plate, no "icon inside an icon".
- No global drop shadow, cast shadow, halo, glow, or bloom — a *subtle* radial ambient
  glow inside a composed background is fine.
- No text, numbers, monograms, watermark.
- No photo/portrait/real-world scene; no realistic human faces as the main subject.
- Do not copy or imitate real brand logos or trademarked shapes.
- Subject fills a strong portion of the canvas but within the safe zones (below).
- Keep it clean: low noise, low detail, one focal point.

### The Playground restriction set (canonical anti-tells)

Harvested from the brief that produced the best-known Portal icon — use it as the
default "avoid" list unless the brief says otherwise:

- No letters, initials, text, monograms (`P`, `Playground`, …).
- No literal dev icons: `</>`, brackets, terminals, cursors, code, chips, circuits,
  robots, brains, charts, lightbulbs, rockets, 3D cubes, AI sparkle/star.
- No literal product imagery (a literal playground, piggy bank, heart organ, …).
- No "AI-generated logo" aesthetic: 3D, renders, metallic/chrome, cinematic lighting,
  heavy glow, dramatic shadows, mockups, textures, excessive detail.
- Must feel like it came from a specialist branding studio.

See `example-playground.md` for how these constraints produced an ownable mark.

## 3. Safe areas (Portal factory)

- Canvas: `1024×1024`.
- iOS: content within `safeZone` 0.66 of the canvas.
- Android adaptive: `glyphScale` 0.45.
- `symbol` mode authors the mark inside those zones with a transparent background;
  `composed` mode authors the full artwork (tile included) and the factory still scales
  its bounding box to the safe zone. Either way, extra breathing room beats clipping.
- Readable at 16 px (favicon/CLI), 32 px, and 1024 px; works on light and dark, and in
  grayscale.

## 4. Concept quality bar (from the Playground brief)

- One central idea, expressible in a sentence.
- A **second reading**: the geometry suggests a concept beyond the literal form.
  Never spell it out with literal iconography.
- Composition of **2–4 primary shapes** on a grid with intentional negative space
  (a continuous channel, not accidental gaps).
- Balanced but slightly dynamic — as if parts are about to interact.
- Must feel like it came from a specialist brand studio, not from a prompt.
- Conceptual references for *quality level* (never copy): Nike, Airbnb, Chase —
  abstract, memorable marks.

## 5. Style presets

Apply **one** preset as the dominant art direction; it wins any conflict. Do not mix
conflicting materials.

| Preset | Intent | Mandatory | Forbidden / avoid |
|---|---|---|---|
| `minimalism` | Extreme reduction, Swiss/Rams/Apple | ≤3 colors; single dominant symbol; works in monochrome; readable tiny | gradients, shadows, 3D, texture, over-design |
| `geometric` | Bauhaus / system geometry | everything on a grid; measurable shapes; exact symmetry; math curves | organic curves, hand-drawn irregularity, texture |
| `gradient` | Modern social-app gradients | smooth transitions; clear direction; no banding | dirty gradients, >4 colors, texture fighting the gradient |
| `flat` | Corporate clarity | solid colors; zero depth; clear contrast | gradients, shadows, any 3D |
| `material` | Material Design layering | soft directional shadows; consistent elevation; clear hierarchy | harsh shadows, extreme realism |
| `android-material` | Material 3 vibe | clean geometry; dynamic color; gentle depth cues | photoreal textures, messy realism, harsh shadows |
| `glassy` | iOS 15+/VisionOS glassmorphism | subtle blur/reflection; legible through contrast; floating layers | flat opacity w/o blur, harsh shadows, heavy solids |
| `clay` | Claymorphism | soft rounded volumes; pastel; diffuse shadows; warm | hard edges, aggressive colors |
| `neon` | Cyberpunk glow | high saturation; strong glow; dark bg assumed; extreme contrast | muted colors, white bg, weak glow |
| `holographic` | Iridescent sci-fi | visible color shift; iridescent material; dynamic light | flat color, no light response |
| `pixel` | Retro 8-bit | strict pixel grid; hard edges; no AA | smooth curves, gradients, soft edges |
| `game` | Game UI | high contrast; expressive; strong silhouette | corporate neutrality, over-minimalism |
| `cute` | Friendly modern brand | rounded shapes; warm/bright colors; gentle shading | harsh geometry, dark palettes, cold minimalism |
| `kawaii` | Chibi cuteness (character-led) | big head/tiny body; huge eyes; thick clean outlines; pastel | sharp angles, dark/aggressive themes, realism |
| `ios-classic` | Pre-iOS7 skeuomorphism | high detail; realistic materials; explicit lighting | flat design, extreme minimalism |
| `woven` | Handmade textile | tactile fabric rhythm; loose symmetry; organic lines | perfect geometry, sterile vector perfection |

For an app launcher glyph the strongest defaults are `geometric`, `minimalism`,
`gradient`, `flat`, `material`, or a custom hint like "monoline geometric with a
subtle gradient".

## 6. Prompt/authoring layering (order that works)

1. **Concept** — subject + second reading (human-readable, one paragraph).
2. **Archetype** — the internal decision (do not surface it in the drawing).
3. **Material / rendering** — default to a clean, matte, 2D/2.5D illustration look
   unless a preset overrides it.
4. **Composition** — 2–4 primitives, grid, negative space, optical centering.
5. **Lighting** — soft and controlled; minimal specular; no bloom/glow.
6. **Style preset** — dominant; overrides conflicts.

## 7. Self-check before drawing

- Can it be recognized at 16 px? In black and white?
- Is there exactly one focal point?
- Is the silhouette strong and the negative space intentional?
- Is it free of literal function icons and "AI-logo" tells?
- Does it feel like a deliberate studio mark rather than a generated illustration?
