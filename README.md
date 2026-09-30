# Portal Skills

Agent skills and plugins for the [Portal](https://portalcloud.fun) ecosystem —
installable with any skills-compatible agent (OpenCode, Claude Code, Codex, …).

## Install

```bash
# Install a single skill
npx skills add https://github.com/portalcloud-io/skills --skill portal-app-icon
```

Or add the marketplace and install from it:

```bash
/plugin marketplace add portalcloud-io/skills
/plugin install portal-app-icon@portalcloud-plugins
```

## Plugins

| Plugin | What it does |
|---|---|
| [`portal-app-icon`](./plugins/portal-app-icon) | Design and install a professional, brand-consistent app icon glyph for a Portal-managed Expo app. Authors `assets/glyph.svg` as SVG, syncs the brand background across iOS/Android/splash, runs `portal icons generate/check/preview`, and validates the result. |

## Structure

This repo is a plugin marketplace (`.claude-plugin/marketplace.json`). Each plugin
lives under `plugins/<name>/` and exposes one or more skills under
`plugins/<name>/skills/<skill>/SKILL.md`, mirroring the
[skills](https://github.com/anthropics/skills) plugin convention.

```
plugins/portal-app-icon/
  README.md
  skills/portal-app-icon/
    SKILL.md
    references/{brief-template, svg-authoring-contract, concepts-and-styles, design-rubric}.md
    scripts/{detect, audit-icon, preview}.mjs
```

## Requirements (per plugin)

See each plugin's README. `portal-app-icon` requires a Portal-managed Expo project
and the [Portal CLI](https://www.npmjs.com/package/@portalcloud-io/cli).

## License

Apache-2.0.
