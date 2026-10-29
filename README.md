# Tasks — fullstack demo

A small fullstack task app: React + Vite frontend, Express API, PostgreSQL.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
open http://localhost:3000
```

The frontend dev server runs on host port 3000 and proxies `/api` to the API
service, so there is a single origin and no CORS setup.

## Layout

| Path | What |
| --- | --- |
| `web/` | Vite + React frontend (dev server, live reload) |
| `api/` | Express API, `node --watch` for live reload |
| `api/db/migrations/` | SQL migrations applied by the `migrate` service |

See `AGENTS.md` for setup details and verification commands.
