# Fork UI bundle (fork-only)

This automation builds the web UI and commits the generated
`docling_serve/ui_static/` bundle on `cloudiful/docling-serve` main so
Git-pinned installs include the UI. It never runs anywhere else.

## Scope

- Repository guard: `cloudiful/docling-serve` only.
- Ref guard: `refs/heads/main` only, including manual dispatches.
- Triggers: push to `main` with a positive `paths` allowlist only (`ui/**`,
  `pyproject.toml`, `.github/workflows/fork-ui-bundle.yml`,
  `scripts/fork_ui_bundle.py`; no `paths-ignore`, which Actions forbids
  alongside `paths`). Generated `docling_serve/ui_static/**` is not listed,
  so bot commits never self-trigger. `workflow_dispatch` on `main` is the
  recovery path.
- Single job `bundle-ui` holds `contents: write`; everything else is read-only.
  No PATs, no extra secrets, no cross-repo pushes.

## What a run does

1. Builds the UI with `npm --prefix ui ci` then `npm --prefix ui run build`.
2. Builds the wheel with `uv build --wheel` (no full ML `uv sync`).
3. Verifies the wheel with
   `python scripts/fork_ui_bundle.py verify-wheel --dist-dir dist`
   (requires `index.html` plus nonempty `assets/`).
4. Force-adds only `docling_serve/ui_static`, checks staged paths stay inside
   that directory, and skips the commit when there is no change.
5. Commits as `github-actions[bot]` and pushes `HEAD:refs/heads/main`
   non-force only when the remote still matches the trigger SHA. A moved main
   (stale queued run or concurrent push) fails instead of overwriting.

Concurrency is serialized with `cancel-in-progress: false` so a stale queued
run sees the moved SHA and fails safely.

## Recovery

- `Actions > fork-ui-bundle > Run workflow > Branch: main` re-runs the bundle.
- Push denied with `403`: enable
  `Settings > Actions > General > Workflow permissions > Read and write permissions`
  for the default token, then re-run. Do not add PATs.
- Push denied by branch protection: an operator merges or temporarily allows
  the bot, then re-runs. Never weaken protection permanently.
- No-op run (`No UI changes to commit`) means the bundle is already current.

## Pins and upstream isolation

- Baseline before automation: `ca16d6a`. The wrapper pin still points at the
  old SHA until an operator verifies CI and moves it.
- After a green `fork-ui-bundle` run, the latest bot commit
  `chore(fork): bundle packaged web UI` becomes the new Git pin for installs
  that need the UI. Record that SHA at the install site; this repo keeps no
  wrapper change in this issue.
- Upstream contributions must cherry-pick feature-only commits. Never include
  `.github/workflows/fork-ui-bundle.yml`, `scripts/fork_ui_bundle.py`,
  `docs/fork-ui-bundle.md`, or bot `ui_static` commits upstream.
