# Setup notes

Personal site for Reza Mosaddiq: React + Vite (`web/`), Express API (`api/`),
PostgreSQL. Persian RTL public site on `/`, admin panel on `/admin`.
Run everything through `docker-compose.base44.yml`; preview is host port 3000.

## How it runs

- `web` — Vite dev server in `node:22`, `./web` bind-mounted, `npm run dev`.
  Vite proxies `/api` to `http://api:4000`, so there is a single origin.
  Vazirmatn is self-hosted through `@fontsource/vazirmatn` (no external font CDN).
- `api` — Express in `node:22`, `./api` bind-mounted, `node --watch`.
- `db` — `postgres:16-alpine`, data in the `db_data` volume.
- `migrate` — one-shot runner over `api/db/migrations/*.sql` (idempotent, sorted by
  name). Must exit 0 before the API starts. `002_site.sql` drops the earlier demo
  `tasks` table and seeds the site's initial content.
- `node_modules` live in named volumes and are installed by each service's startup
  command, so dependency changes apply on the next `docker compose up`.

Local DB credentials (`app` / `app_dev_password`) are dev-only, inline in compose.

## Content model

All editable content lives in Postgres:

| table | used by |
| --- | --- |
| `projects` (`category`: `app` \| `ai` \| `future`) | apps, AI projects, future projects |
| `gallery_images` | gallery grid + lightbox |
| `settings` (single row, id = 1) | hero image, contact email, socials, admin password hash |
| `contact_messages` | contact form inbox in the admin panel |

`status` is `published` \| `in_development` \| `concept`; the public site never
labels a non-published item as released. A project without `link_url` renders a
disabled button plus a note — the site never invents store or social links.

## Admin auth

- Password is stored as a bcrypt hash in `settings.admin_password_hash`.
- First visit to `/admin` with no hash shows a one-time setup form
  (`POST /api/admin/setup`, which refuses once a hash exists). Set the password
  yourself there; nobody else knows it.
- Session = HMAC-signed httpOnly cookie (`SESSION_SECRET`, 12h). Every
  `/api/admin/*` route except setup/login/logout is guarded by `requireAdmin` on
  the server; the client never decides authorization.
- `SESSION_SECRET` comes from `.env.base44-defaults` in development, with
  `/run/base44/app.env` listed after it in Compose so real platform secrets win.
- To reset a forgotten password: `UPDATE settings SET admin_password_hash = NULL
  WHERE id = 1;` then open `/admin` again.

## Spam and validation

- Contact form: server-side validation for every field, a hidden honeypot field
  (`website`), and an in-memory limit of 5 submissions per IP per 10 minutes.
- Login attempts are limited to 10 per IP per 15 minutes.
- The limiter is in-memory: it assumes one API instance.

## Sandbox overrides

- `BASE44_PREVIEW_MODE` is passed through as a bare Compose entry (never hardcoded).
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed to `web`; Vite (>= 6.1)
  appends it to `server.allowedHosts` so the preview proxy's host is accepted.

## Verifying

```bash
docker compose -f docker-compose.base44.yml ps
curl -s http://localhost:3000/api/site | head -c 400      # site content
curl -s -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"تست","email":"t@example.com","subject":"سلام","message":"متن آزمایشی پیام"}'  # 201
curl -s http://localhost:3000/api/admin/messages          # 401 without a session
```

No test suite or linter is configured yet.
