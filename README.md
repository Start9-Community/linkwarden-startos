<p align="center">
  <img src="icon.png" alt="Linkwarden Logo" width="21%" />
</p>

# Linkwarden on StartOS

> **Upstream docs:** <https://docs.linkwarden.app/>
>
> Everything not listed in this document should behave the same as upstream
> Linkwarden. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

Linkwarden is a self-hosted, collaborative bookmark manager. It captures links
into collections, archives each page as a screenshot, PDF, and readability
extract via a bundled headless browser + `monolith`, and indexes everything
for full-text search through MeiliSearch. Upstream: <https://github.com/linkwarden/linkwarden> (AGPL-3.0-only).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Three unmodified upstream images, run as three StartOS daemons sharing one
localhost netns:

| Daemon | Image | Architectures |
| --- | --- | --- |
| `linkwarden` | `ghcr.io/linkwarden/linkwarden` | `x86_64`, `aarch64` |
| `postgres` | `postgres:16-alpine` | `x86_64`, `aarch64` |
| `meilisearch` | `getmeili/meilisearch` | `x86_64`, `aarch64` |

The Linkwarden image has a `CMD` only (no `ENTRYPOINT`):

```
sh -c "export PATH=/data/node_modules/.bin:$PATH && \
prisma migrate deploy --schema=/data/packages/prisma/schema.prisma && \
exec concurrently -k -n web,worker \"cd /data/apps/web && exec next start\" \"cd /data/apps/worker && exec tsx worker.ts\""
```

Consequences baked into this package:

- It runs `prisma migrate deploy` **on every startup**, then supervises web +
  worker via `concurrently`. There is therefore **one** `linkwarden` daemon
  (no migration oneshot) and its `ready` check has a 60 s grace period for
  first-run migrations + Next.js warmup.
- `useEntrypoint()` (no override) preserves that CMD. If it ever fails to fire
  on this CMD-only image during a runtime regression, the documented fallback
  is to pass the literal argv above verbatim.
- The image sets `ENV NODE_ENV=production`, which makes `NEXTAUTH_URL` a
  **mandatory** runtime env var — that requirement drives the Primary URL
  derivation strategy described below.
- `concurrently -k` is a process supervisor, not a PID-1 init system, so
  `runAsInit` is left at its default.

Postgres is started with `listen_addresses=127.0.0.1` (loopback only), reached
by the app as `127.0.0.1:5432`. MeiliSearch's default CMD listens on `7700`;
only `MEILI_MASTER_KEY` is set (no `MEILI_ENV`), mirroring the verified-
working upstream compose.

## Volume and Data Layout

Three volumes (not one-with-subpaths), because `sdk.Backups.withPgDump` and
`.addVolume` back up a whole volume by ID with no subpath support.

| Volume | Mount point | Contents |
| --- | --- | --- |
| `main` | `/data/data` | Linkwarden archives and uploads (where the image writes `STORAGE_FOLDER=data`) |
| `db` | `/var/lib/postgresql` | PostgreSQL data directory (image default `PGDATA=/var/lib/postgresql/data`) |
| `search` | `/meili_data` | MeiliSearch index |

`store.json` lives at the root of the `main` volume. It holds the package's
internal secrets + feature flags (see Quick Reference), all of which are
seeded at install by `init/seedFiles.ts` and **not** regenerated on restore.

## Installation and First-Run Flow

1. **Secrets are generated automatically** at install: `pgPassword`,
   `nextAuthSecret`, `meiliMasterKey`, plus defaults (`primaryUrl=""`,
   `disableRegistration=false`, `postgres`/`postgres`).
2. **No admin-credential action exists.** Linkwarden has no API/CLI to
   provision a user, so registration is **enabled** by default and the first
   web registrant becomes the admin. An **`important`** task
   (`init/taskDisableRegistration.ts`) reminds the user to register then run
   **Disable Registration**.
3. **`NEXTAUTH_URL` is derived** automatically from the live `ui` interface
   address (preferring publicly-reachable hosts). An **`optional`** task
   (`init/watchPrimaryUrl.ts`) points SSO users at the **Set Primary URL**
   action.
4. **Database migrations run on every startup**, so there is no first-run
   oneshot to wait on.

## Configuration Management

| StartOS-Managed | Upstream / not yet exposed |
| --- | --- |
| `DATABASE_URL`, `MEILI_HOST`, `MEILI_MASTER_KEY` (derived from seeded secrets) | AI provider keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_MODEL`, …) |
| `NEXTAUTH_URL` (auto-derived or pinned via the action) | S3 / Spaces archive storage (`SPACES_*`) |
| `NEXTAUTH_SECRET` (seeded) | SMTP (`EMAIL_SERVER`, `EMAIL_FROM`, `NEXT_PUBLIC_EMAIL_PROVIDER`) |
| `NEXT_PUBLIC_DISABLE_REGISTRATION` (toggled by the action) | Most SSO/OAuth provider credentials (`GITHUB_ID`, `GOOGLE_CLIENT_SECRET`, …) |
| `NEXT_PUBLIC_CREDENTIALS_ENABLED`, `NEXT_PUBLIC_ADMIN` (fixed) | Other tuning envs (`PAGINATION_TAKE_COUNT`, `ARCHIVE_TAKE_COUNT`, …) |

## Network Access and Interfaces

| Interface | Internal port | Protocol | Purpose |
| --- | --- | --- | --- |
| `ui` | `3000` | `http` | The web UI (also serves the API). Single exposed interface. |

All sidecars bind `127.0.0.1` only (shared netns). Reachable via LAN IP,
`.local`, `.onion`, and custom StartOS domains like any UI interface.

## Actions (StartOS UI)

- **Disable / Enable Registration** (`toggle-registration`)
  - *Purpose:* toggles server-side signup gating.
  - *Visibility:* always enabled. The action's own name/description/warning
    are dynamic (async metadata) and reflect the current state.
  - *Inputs:* none. *Outputs:* a confirmation message.
  - *Caveat:* `NEXT_PUBLIC_*` is baked at `next build`, so the toggle enforces
    the gate on the **server** (the signup API rejects) while the client
    "Register" button may keep rendering cosmetically.

- **Set Primary URL** (`set-primary-url`)
  - *Purpose:* pin (or unpin via **Auto**) the origin used for `NEXTAUTH_URL`.
  - *Visibility:* always enabled; also surfaced as an `optional` task.
  - *Inputs:* a `dynamicSelect` of the `ui` interface's current non-local
    hostnames (plus an **Auto** option).
  - *Outputs:* the chosen host. The service restarts to apply it.
  - *When to use:* only for SSO/OAuth, where the OAuth callback URL must match
    your registered external domain. Password login is unaffected.

## Backups and Restore

`sdk.Backups.withPgDump` captures the PostgreSQL database logically (faster
and version-robust vs rsyncing a live cluster's data dir), then two
`.addVolume`s rsync the rest:

| Backed up | How |
| --- | --- |
| PostgreSQL (`db` volume) | `pg_dump` (logical dump/restore) |
| Archives + uploads (`main` volume) | whole-volume rsync (includes `store.json`) |
| MeiliSearch index (`search` volume) | whole-volume rsync |

The pg password is read lazily (during restore), after the `main` volume —
which carries `store.json` — has been restored, so the original install's
password is used. Restoring brings back accounts, collections, links,
archives, and the search index; the trio then starts cleanly with idempotent
migrations.

## Health Checks

| Daemon | Probe | Messages |
| --- | --- | --- |
| `postgres` | `pg_isready -h 127.0.0.1 -U postgres -d postgres` (hidden display) | "PostgreSQL is ready" / "Waiting for PostgreSQL" |
| `meilisearch` | `checkPortListening(7700)` (hidden display) | "MeiliSearch is ready" / "Starting MeiliSearch" |
| `linkwarden` | `checkWebUrl http://127.0.0.1:3000/` (displayed), 60 s grace | "The web interface is ready" / "The web interface is not ready" |

`checkWebUrl` (not just port-listening) catches "port bound but Next.js still
compiling", and matches the image's own `curl` HEALTHCHECK.

## Dependencies

None. PostgreSQL and MeiliSearch are bundled as localhost sidecars, not
declared as StartOS dependencies.

## Limitations and Differences

1. **`NEXT_PUBLIC_*` is build-time in Next.js.** Flipping
   `NEXT_PUBLIC_DISABLE_REGISTRATION` at runtime is enforced on the **server**
   (the signup API rejects), but the client bundle may keep rendering the
   "Register" button cosmetically. The gate is secure; the lag is cosmetic.
2. **No admin-credential action.** The first web registrant becomes the admin.
   There is no CLI/API to provision an admin user upstream.
3. **NEXTAUTH_URL auto-derivation.** StartOS fronts the service with a reverse
   proxy reachable at several addresses; the package derives `NEXTAUTH_URL`
   from the `ui` interface's current public address (preferring clearnet/Tor,
   falling back to LAN/loopback). For SSO/OAuth, pin the Primary URL to your
   registered external domain.
4. **SSO provider credentials are not yet exposed via actions.** Set them in
   the container directly until a dedicated config action ships.
5. **`useEntrypoint()` on a CMD-only image** is the #1 runtime risk flagged in
   `TODO.md`; the fallback is the literal CMD argv from the upstream
   Dockerfile.
6. **Backup size** — `/data/data` (archives/screenshots) can grow with use.
   v1 backs it up as a whole volume (`addVolume`); switch that one volume to
   `addSync` (incremental rsync) if it balloons.

## What Is Unchanged from Upstream

- The web UI, API, collections, tags, link archiving (screenshots / PDFs /
  readability via the bundled headless browser + `monolith`), full-text
  search, teams, and RSS follow the upstream docs.
- The image's bundled `concurrently` web + worker process model and its
  Prisma schema / migrations are unchanged.
- MeiliSearch master-key-only configuration (no `MEILI_ENV`) mirrors the
  verified-working upstream compose.

## Contributing

See [`AGENTS.md`](./AGENTS.md) for the agent workflow, the SDK pin rationale,
and how to inspect a running install. The remaining verification checklist
lives in [`TODO.md`](./TODO.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: linkwarden
architectures: [x86_64, aarch64]
volumes:
  main: /data/data
  db: /var/lib/postgresql
  search: /meili_data
ports:
  ui: 3000
dependencies: []
startos_managed_env_vars:
  - NEXTAUTH_URL        # derived from the ui host, or pinned via Set Primary URL
  - NEXTAUTH_SECRET
  - DATABASE_URL
  - MEILI_HOST
  - MEILI_MASTER_KEY
  - NEXT_PUBLIC_DISABLE_REGISTRATION
  - NEXT_PUBLIC_CREDENTIALS_ENABLED
  - NEXT_PUBLIC_ADMIN
  - POSTGRES_USER
  - POSTGRES_PASSWORD
  - POSTGRES_DB
actions:
  - toggle-registration
  - set-primary-url
store_json:
  pgPassword: PostgreSQL superuser password (seeded at install)
  nextAuthSecret: NextAuth signing secret
  meiliMasterKey: MeiliSearch master key
  primaryUrl: pinned NEXTAUTH_URL origin (empty = auto-derive)
  disableRegistration: server-side signup gate
  postgresUser: postgres
  postgresDb: postgres
```
