# AGENTS.md

Suparedirect is a self-hosted anonymous redirect service (Express) with a React stats dashboard. People run it to link out without leaking the Referer header.

## Verify a change

CI (`.github/workflows/ci.yml`, Node LTS) runs these in order:

- Repo root: `npm ci`, then `npm run build`, then `npm test`.
- `dashboard/`: `npm ci`, then `npm run build` (`tsc -b && vite build`).

`npm start` runs `node dist/index.js`, so build before starting.

## Docs site

The project website is a VitePress site in `docs/`, published to `https://projects.halit.org/suparedirect/` by `.github/workflows/docs.yml`. It has its own `package.json`, lockfile and `tsconfig.json`, and is kept out of the Docker image by `.dockerignore`.

- Build it with `cd docs && npm ci && npm run build`. Use `npm run dev` for a local preview.
- Pages in `docs/guide/` describe what `src/index.ts` and the dashboard do. Update them when behaviour changes.
- A push that only touches `docs/**` does not run the Docker pipeline in `main.yml`.

## Gotchas

- Every push to `main` runs `.github/workflows/main.yml`, which builds the Docker image and pushes `halitsever/suparedirect:latest` to Docker Hub. Merging a PR ships it.
- `src/index.ts` calls `app.listen(3000)` only when `NODE_ENV` is not `test`. Tests import `app` and drive it with supertest.
- Port 3000 is hard-coded in `src/index.ts` and in the `/api` proxy of `dashboard/vite.config.ts`. Change both together.
- The redirect page writes the target URL into an inline script through `JSON.stringify(encodeURI(...))`. Keep that escaping when touching the redirect handler.
- Redirect stats live in memory (last 500 entries) and reset on restart.
- The Docker image runs `npm run start`, which serves the dashboard through the Vite dev server on 5173, not a static build. The Dockerfile uses `npm install` in `dashboard/` so npm picks the Alpine (musl) rollup binary.
- Three lockfiles, `package-lock.json`, `dashboard/package-lock.json` and `docs/package-lock.json`, each bumped by Dependabot. Commit only the one you changed.

## Conventions

- Commit subjects in conventional-commit style, in English, subject line only: no body, no trailer.
- Work on a branch and open a PR against `main`. The owner merges.
- Write new text without emoji. Keep code comments short, one line where possible, and say why.
- The README follows the owner's template. Keep every image served from `halitsever-api.vercel.app` byte-for-byte; only the `title=` value of `api/repo-title` and the issue wrapper link may be corrected.
- Leave version bumps, publishing and Docker releases to the owner.
