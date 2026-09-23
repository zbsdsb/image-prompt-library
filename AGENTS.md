# Repository Guidelines

## Project Structure & Module Organization

`backend/` contains the FastAPI app, routers, services, database code, and numbered SQL migrations. `frontend/src/` holds React components, hooks, API access, utilities, styles, and bundled assets. Python and Node tests share `tests/`; public documentation lives in `docs/`, reusable demo fixtures in `sample-data/`, and setup/development scripts in `scripts/`. `library/` is local runtime storage, not source data.

## Build, Test, and Development Commands

- `./scripts/setup.sh` installs Python and root-level npm dependencies.
- `./scripts/dev.sh` runs the API and Vite hot-reload server; open `http://127.0.0.1:5177/`.
- `./scripts/start.sh` builds the frontend and serves the app at `http://127.0.0.1:8000/`.
- `source .venv/bin/activate && python -m pytest -q` runs the Python suite.
- `npm run test:frontend` runs Node's frontend utility/view tests; `npm run build` type-checks and builds the frontend.
- `./scripts/smoke-test.sh` checks an already running local server.

## Coding Style & Naming Conventions

Follow nearby code: Python uses four-space indentation, `snake_case` modules/functions, and `PascalCase` classes. TypeScript/TSX uses two-space indentation, single quotes, `camelCase` utilities/hooks, and `PascalCase` React component files. Keep TypeScript compatible with the strict `tsconfig.json`; the build runs `tsc`. There is no separate lint or formatter command configured, so avoid unrelated formatting churn.

## Testing Guidelines

Use `pytest` for backend behavior (`tests/test_*.py`) and Node's built-in test runner for frontend behavior (`tests/*.test.mjs`). Add focused regression coverage for fixes, especially API, storage, and public-install behavior. Run both suites and `npm run build` before a PR; run the smoke test when a server is available. No numeric coverage threshold is configured.

## Commit & Pull Request Guidelines

Recent commits commonly use short imperative summaries with `feat:`, `fix:`, `test:`, or `docs:` prefixes. Keep changes small and describe their behavior, related issue, verification commands, and any remaining limitations in the PR; include screenshots for visible UI changes. Stage explicit paths only. Before committing, inspect `git status --short`, `git diff --cached --name-status`, and `git diff --cached`; before pushing, inspect `git diff --name-status origin/main...HEAD`.

## Security & Local Data

Preserve the local-first privacy model. Keep `.env`, credentials, private prompts/images, `library/db.sqlite*`, generated media, backups, local agent/QA state, and machine-specific artifacts out of commits. Treat `.agents/`, `.codex/`, `.codex-qa-*`, `.codebase-memory/`, `.qa-*`, `.superpowers/`, `docs/plans/`, and `docs/qa/` as local-only; preserve unrelated user files. See `CONTRIBUTING.md` and `SECURITY.md` for the fuller policies.
