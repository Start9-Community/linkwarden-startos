# Updating

How to bump each image in this package. All three are pinned by tag in
`startos/manifest/index.ts` under `images.<id>.source.dockerTag`.

## Linkwarden

1. Check the new tag exists and is multi-arch:
   ```bash
   T=$(curl -s "https://ghcr.io/token?scope=repository:linkwarden/linkwarden:pull" | jq -r .token)
   curl -s -H "Authorization: Bearer $T" "https://ghcr.io/v2/linkwarden/linkwarden/tags/list" | jq -r '.tags[]' | sort -V | tail
   docker manifest inspect ghcr.io/linkwarden/linkwarden:<NEW_TAG> | jq -r '.manifests[].platform.architecture'
   ```
   Both `amd64` (+`arm64` to keep `aarch64`) must be present.
2. Read the upstream release notes. If Prisma schema migrations changed, the
   image runs them on startup (`prisma migrate deploy`) — confirm they are
   backwards-compatible against an existing `db` volume; if a manual migration
   step is required, add a `versions/` migration oneshot.
3. Set the new tag in `manifest/index.ts`:
   ```ts
   linkwarden: { source: { dockerTag: 'ghcr.io/linkwarden/linkwarden:<NEW_TAG>' }, arch: ['x86_64','aarch64'] },
   ```
4. Add a `VersionInfo` entry in `versions/` (or bump `current.ts`'s `version`
   and `releaseNotes`) describing the change. The `version` field is the
   StartOS package version `<upstream>:<package>`; bump the package segment
   for any recipe change.
5. Re-derive the image's `CMD` / env expectations from the upstream `Dockerfile`
   and `.env.sample`. If `NEXTAUTH_URL`, the migration command, or the
   web/worker process model changed, update `main.ts`.
6. `npm run check`, `make x86`, and run the `TODO.md` verification checklist on
   the StartOS box.

## MeiliSearch

Meili is pinned to the tag upstream's `docker-compose.yml` ships, to avoid
untested drift. To bump:

1. Confirm arch support:
   ```bash
   docker manifest inspect getmeili/meilisearch:<NEW_TAG> | jq -r '.manifests[].platform.architecture'
   ```
2. Update `manifest/index.ts` (`meilisearch.source.dockerTag`).
3. Do **not** add `MEILI_ENV` in `main.ts` unless an upstream change requires
   it — the key-only config is verified-working.

## PostgreSQL

Pinned to `postgres:16-alpine` to match upstream. Keep the major on `16`
unless upstream bumps it; a major bump requires a `pg_upgrade` story (the
logical `pg_dump`/`pg_restore` backup handles major-version restores, but a
running volume upgrade is not schema-free).

```bash
T2=$(curl -s "https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/postgres:pull" | jq -r .token)
curl -s -H "Authorization: Bearer $T2" "https://registry.hub.docker.com/v2/library/postgres/manifests/16-alpine" -H "Accept: application/vnd.docker.distribution.manifest.list.v2+json" | jq -r '.manifests[].platform.architecture'
```

## SDK

Pinned to `@start9labs/start-sdk@1.5.3`. Do not bump to 2.x until StartOS
`0.4.0-beta.10` is published and the workspace host is upgraded — see the
workspace `AGENTS.local.md`.
