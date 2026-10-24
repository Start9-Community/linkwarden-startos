# Updating the upstream version

Three images are pinned by tag in `startos/manifest/index.ts`: linkwarden as
the `IMAGE` build arg of the root `Dockerfile`, the other two under
`images.<id>.source.dockerTag`. Linkwarden is the upstream this package tracks;
the other two follow whatever upstream's Compose file ships.

## Linkwarden

- **linkwarden** ([linkwarden/linkwarden](https://github.com/linkwarden/linkwarden))
  — fetch the latest release tag:

  ```sh
  gh release view -R linkwarden/linkwarden --json tagName -q .tagName
  ```

  The Docker tag keeps the leading `v` (`v2.16.0` →
  `ghcr.io/linkwarden/linkwarden:v2.16.0`). Confirm both architectures:

  ```sh
  docker buildx imagetools inspect ghcr.io/linkwarden/linkwarden:<new version> \
    --format '{{range .Manifest.Manifests}}{{.Platform.OS}}/{{.Platform.Architecture}} {{end}}'
  ```

  `unknown/unknown` rows are build attestations, not platforms.

### Applying the bump

- Bump the `IMAGE` build arg in `startos/manifest/index.ts`.
- Set `version` in `startos/versions/current.ts` to `<new version>:0` and
  rewrite `releaseNotes` in every locale.
- Read the release notes for Prisma schema changes. The image applies migrations
  itself on startup, so a backwards-compatible migration needs nothing here — but
  one that requires a manual step needs a package migration in the same release.
- Re-derive the image's command and environment expectations from its config
  (`docker buildx imagetools inspect ... --format '{{json .Image}}'`) and from
  upstream's `.env.sample`. In particular, confirm that the command still runs
  the migrations before starting web and worker, and that `NEXTAUTH_URL` still
  wants an origin with the `/api/v1/auth` suffix — `main.ts` builds it.

## MeiliSearch

Pinned to the tag upstream's Compose file ships, to avoid untested drift. To
bump it, check the architectures the same way and update
`images.meilisearch.source.dockerTag`. MeiliSearch refuses an index written by
another minor version, so a minor bump also needs a package migration that
discards the old index — copy the one `2.16.3:0` carries, which deletes
`data.ms` and clears `"Link"."indexVersion"` so Linkwarden's worker rebuilds
the index from Postgres. Deleting `data.ms` alone leaves search empty. Beyond
upstream's Compose, which sets only `MEILI_MASTER_KEY`, the package sets
`MEILI_NO_ANALYTICS=true`; keep it on every bump, and resist adding more
without an upstream change that calls for it.

## PostgreSQL

Pinned to the major upstream's Compose file ships. Keep the major where it is
unless upstream moves: a major bump cannot be done by swapping the tag, because
the existing cluster in the `db` volume is not readable by a newer major. The
logical `pg_dump` backup does survive a major bump, so the migration path is
backup, reinstall, restore — which means a major bump needs release notes that
say so.
