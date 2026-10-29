# Setup notes

Tasks app: React + Vite (`web/`), Express API (`api/`), PostgreSQL. Everything runs
through `docker-compose.base44.yml`; the preview is served from host port 3000.

## How it runs

- `web` — Vite dev server in `node:22` with `./web` bind-mounted, `npm run dev`
  inside the container. Vite proxies `/api` to `http://api:4000`, so the browser
  only ever talks to one origin (port 3000).
- `api` — Express in `node:22` with `./api` bind-mounted, `npm run dev`
  (`node --watch`, so server edits restart automatically).
- `db` — `postgres:16-alpine`, data in the `db_data` volume.
- `migrate` — one-shot `postgres:16-alpine` container that runs every
  `api/db/migrations/*.sql` through `psql`. It is idempotent and must exit 0 before
  the API starts. Add new migrations as numbered SQL files; no ORM.
- `node_modules` live in named volumes (`api_node_modules`, `web_node_modules`) and
  are installed by each service's startup command from the current manifest, so
  dependency changes apply on the next `docker compose up`.

Local database credentials (`app` / `app_dev_password`) are dev-only and wired
inline in the compose file; no external credentials are required.

## Sandbox overrides

- `BASE44_PREVIEW_MODE` is passed through as a bare Compose entry (never hardcoded)
  for parity with the rest of the stack; the app behaves identically when unset.
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed through to `web` and appended by
  Vite (>= 6.1) to `server.allowedHosts`, so the preview proxy's host is accepted.

## Verifying

```bash
docker compose -f docker-compose.base44.yml ps
curl -s http://localhost:3000/api/tasks            # JSON list
curl -s -X POST http://localhost:3000/api/tasks \
  -H 'Content-Type: application/json' -d '{"title":"hello"}'   # 201 + task
```

A healthy `api` healthcheck (`/api/health`) also proves database connectivity,
because it runs `SELECT 1`.

There is no test suite or linter configured yet.
