# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## Inspecting a running install

To run a command inside a service's container (read its generated config, grep app logs), use `start-cli package attach <id> -n <subcontainer-name> -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts`, e.g. `-n linkwarden`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers". A service with more than one subcontainer requires a selector; with none given, `attach` falls back to an interactive picker that panics in a non-TTY shell — that's the missing selector, not a TTY requirement.

## Package-specific notes

- **SDK pinned to `@start9labs/start-sdk@1.5.3`.** Do not bump to 2.x. The
  workspace host is StartOS 0.4.0-beta.9 (see the workspace
  `AGENTS.local.md`); SDK 2.0+ targets 0.4.0-beta.10 and produces `.s9pk`
  files that fail to install / hang on this host.
- **3 daemon package** (`postgres`, `meilisearch`, `linkwarden`) sharing one
  netns (`127.0.0.1`). The linkwarden image runs web + worker + `prisma
  migrate deploy` itself via `concurrently` in its `CMD`, so it is a single
  daemon (no oneshot needed for migrations).
- See `TODO.md` for the remaining verification checklist and `README.md`
  for the architecture and the known runtime nuances (the `NEXT_PUBLIC_*`
  build-time caveat, the `NEXTAUTH_URL` derivation strategy, and the
  `useEntrypoint()`-on-a-CMD-only-image risk).
