# Contributing

Thanks for helping make Portal Skills better. This repository hosts agent skills for
the portal ecosystem; contributions of new skills, improvements, docs, and bug fixes
are welcome.

## Ways to contribute

- **New skill** — package a repeatable Portal workflow.
- **Improve an existing skill** — sharpen prompts, references, or scripts.
- **Docs** — clarify the README or a plugin's README.
- **Bug report / idea** — open an issue describing the dev workflow you want to automate.

## Repository conventions

- One plugin per folder under `plugins/<name>/`.
- Each plugin registers itself in [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json).
- Each skill is self-contained: `plugins/<name>/skills/<skill>/SKILL.md` plus its own
  `references/` and `scripts/`.
- `SKILL.md` frontmatter must include a `name` and a `description`. The description is
  what the agent uses to decide when to load the skill — make the trigger explicit and
  keyword-rich (say **when** to use it and **what** it produces).
- Keep skills **deterministic and side-effect-scoped**: no secrets, no surprising
  writes outside the target project, and always back up before overwriting user files.
- Prefer **plain Node scripts** (`node`, ESM `.mjs`). Do not add heavyweight
  dependencies; resolve tools (e.g. `sharp`) from the target project or the Portal CLI.
- Never commit API keys or generated credentials.

## Adding a skill

1. Create the plugin and skill folders:

   ```text
   plugins/<plugin-name>/
     README.md
     skills/<skill-name>/
       SKILL.md
       references/
       scripts/
   ```

2. Register the plugin in `.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "<plugin-name>",
     "source": "./plugins/<plugin-name>",
     "description": "One line on what it does."
   }
   ```

3. Write `SKILL.md` with clear phases (detect → act → verify) and explicit guardrails.

4. Test end-to-end against a real Portal project before opening a PR.

## Testing

There is no build step. Validate your scripts directly:

```bash
node --check plugins/<plugin>/skills/<skill>/scripts/*.mjs
node plugins/<plugin>/skills/<skill>/scripts/detect.mjs /path/to/portal-app
```

Run the full skill flow against a Portal-managed Expo project and confirm it leaves
the project in a clean, expected state.

## Pull requests

- Keep one PR focused on one objective; split unrelated changes.
- Describe the workflow the skill automates and how you tested it.
- Use clear commit messages (e.g. `feat: add <skill>`, `fix: <skill> ...`).
- Complete the PR checklist.

## License

By contributing you agree that your contributions are licensed under the
[Apache-2.0](./LICENSE) license.
