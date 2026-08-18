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
   Both `amd64` (+`arm64` to keep `aarch64`) must be present. Without a local
   docker daemon, read the index straight from the registry instead:
   ```bash
   curl -s -H "Authorization: Bearer $T" \
     -H "Accept: application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json" \
     "https://ghcr.io/v2/linkwarden/linkwarden/manifests/<NEW_TAG>" | \
     jq -r '.manifests[] | "\(.platform.os)/\(.platform.architecture)"'
   ```
   `unknown/unknown` rows are buildkit attestation manifests, not platforms.
2. Read the upstream release notes. If Prisma schema migrations changed, the
   image runs them on startup (`prisma migrate deploy`) — confirm they are
   backwards-compatible against an existing `db` volume; if a manual migration
   step is required, add a `versions/` migration oneshot.
3. Set the new tag in `manifest/index.ts`:
   ```ts
   linkwarden: { source: { dockerTag: 'ghcr.io/linkwarden/linkwarden:<NEW_TAG>' }, arch: ['x86_64','aarch64'] },
   ```
4. Bump `versions/current.ts`'s `version` and `releaseNotes` in place. The
   `version` field is the StartOS package version `<upstream>:<package>`; an
   upstream bump resets the package segment to `0`, a wrapper-only change
   increments it. Only spin off a historical `versions/v<X>_<Y>.ts` (and add
   it to `index.ts`'s `other`) when the version **currently in** `current.ts`
   carries a non-empty `migrations.up` — see `versions.md` "When to Create a
   New Version File". Localize the notes in all five locales.
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

Pinned to `@start9labs/start-sdk@2.0.9` (upgraded in `c979da1`, verified on
StartOS 0.4.0.1). The old 1.5.3 pin is retired — see the workspace
`AGENTS.local.md` for what 2.0.0 changed.
