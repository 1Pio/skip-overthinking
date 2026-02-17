# Agent Operating Notes

## gsd-tools commit quirks (important)

- `node ... gsd-tools.js commit` uses a minimal positional parser, not a full CLI flag parser.
- The commit message is read from `args[1]` only.
- `--help` is **not** treated as help for the `commit` subcommand; it is treated as the commit message.
- Result: running `node ... gsd-tools.js commit --help` can create a real commit with message `--help`.

## Safe commit usage for agents

- Always pass an explicit quoted message as the first argument after `commit`.
- Preferred pattern:

```bash
node C:/Users/aaron/.config/opencode/get-shit-done/bin/gsd-tools.js commit "docs(03): capture phase context" --files ".planning/phases/03-ratings-weights-and-coverage-integrity/03-CONTEXT.md"
```

- Never call `commit --help`; use repository docs or inspect script source instead.
- After any commit attempt, verify with:

```bash
git log -1 --oneline
git status --short
```

## Sync discipline after commit/push

- Local commit is not enough; keep local and remote in sync.
- Standard flow:
  1. `git status`
  2. `git push` (or `git push -u <remote> <branch>` on first push)
  3. `git status` again to confirm clean and up to date
- If collaborators/agents also commit, sync before new work (if truly safe to do so and/or work was approved):
  - `git fetch --all --prune`
  - `git pull --rebase` (or project-preferred pull strategy)
