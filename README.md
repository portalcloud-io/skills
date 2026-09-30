# Portal Skills

[![License](https://img.shields.io/github/license/portalcloud-io/skills)](./LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/portalcloud-io/skills)](https://github.com/portalcloud-io/skills/commits/main)
[![Stars](https://img.shields.io/github/stars/portalcloud-io/skills)](https://github.com/portalcloud-io/skills/stargazers)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Works with OpenCode](https://img.shields.io/badge/agent-OpenCode-7c3aed)](https://opencode.ai)
[![Works with Claude Code](https://img.shields.io/badge/agent-Claude%20Code-d97706)](https://claude.com/claude-code)

**Agent skills for the [Portal](https://portalcloud.fun) ecosystem** — installable with any
skills-compatible agent (OpenCode, Claude Code, Codex, and more).

Portal Skills packages repeatable, opinionated workflows that plug directly into the
Portal CLI, so a developer can go from a fresh project to a polished result without
hand-writing boilerplate or glue.

![Portal app icon preview](./docs/preview.png)

## Skills

| Skill | Description |
|---|---|
| [`portal-app-icon`](./plugins/portal-app-icon) | Design and install a professional, brand-consistent **app icon** for a Portal-managed Expo app. Authors `assets/glyph.svg` as clean SVG, syncs the brand background across iOS / Android / splash, runs `portal icons generate`, and validates geometry, contrast, monochrome, and small-size legibility. |

## Install

Install a single skill with the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add https://github.com/portalcloud-io/skills --skill portal-app-icon
```

Or add this repository as a marketplace and install from it (Claude Code):

```text
/plugin marketplace add portalcloud-io/skills
/plugin install portal-app-icon@portalcloud-plugins
```

## Quick start

Once installed, just describe what you want in natural language:

```text
Create an app icon for my Portal app. It's a calm habit tracker — make it feel
premium and geometric. Show me a few concepts, then install the best one.
```

The agent designs the mark, writes `assets/glyph.svg`, syncs the brand background
across iOS, Android, and the splash screen, runs the Portal icon factory, and audits
the result before handing it back.

## How `portal-app-icon` works

```text
brief → concepts → assets/glyph.svg → portal icons generate/check/preview → audit → critique loop
```

1. **Detect** the Portal project and current icon state.
2. **Brief** — capture the product, audience, personality, style, and palette.
3. **Concepts** — propose 3–5 named directions with a central metaphor and a second reading.
4. **Author** — write one clean, transparent, symbol-only SVG and patch `assets/icon-source.json`.
5. **Generate** — run the Portal factory: one design → 15 per-variant assets
   (`production` / `preview` / `development`).
6. **Audit & critique** — check centering, safe zones, contrast, monochrome, and
   small-size legibility, then iterate on a rubric.

## Requirements

- A Portal-managed Expo project (`assets/glyph.svg` + `assets/icon-source.json`).
- The [Portal CLI](https://www.npmjs.com/package/@portalcloud-io/cli) (`@portalcloud-io/cli`)
  available locally in the project or via `npx`.
- Node.js ≥ 20 (the helper scripts use `sharp`, resolved from the project's Portal CLI).

## Repository layout

This repository is a **plugin marketplace** (`.claude-plugin/marketplace.json`). Each
plugin lives under `plugins/<name>/` and exposes one or more skills under
`plugins/<name>/skills/<skill>/SKILL.md`.

```text
.
├── .claude-plugin/marketplace.json
├── docs/preview.png
├── plugins/
│   └── portal-app-icon/
│       ├── README.md
│       └── skills/portal-app-icon/
│           ├── SKILL.md
│           ├── references/   # brief, SVG contract, concepts & styles, rubric
│           └── scripts/      # detect, audit-icon, preview
└── README.md
```

## Adding a skill

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: add a plugin under `plugins/`,
register it in `.claude-plugin/marketplace.json`, and keep each skill self-contained
(its own `SKILL.md`, references, and scripts).

## Links

- Portal documentation — [docs.portalcloud.fun](https://docs.portalcloud.fun)
- Portal CLI on npm — [@portalcloud-io/cli](https://www.npmjs.com/package/@portalcloud-io/cli)
- Portal platform — [portal_cloud](https://github.com/portalcloud-io/portal_cloud)

## License

[Apache-2.0](./LICENSE)
