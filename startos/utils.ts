// Shared constants and helpers used across this package's startos/ code.
// Port numbers referenced by both main.ts (env wiring / health checks) and
// interfaces.ts (binding) live here so the two stay in sync.

// Internal port the linkwarden web UI (next start) listens on. Matches the
// image's HEALTHCHECK + EXPOSE.
export const uiPort = 3000

// MeiliSearch default listen port (upstream compose pins getmeili/meilisearch,
// whose default is 7700). Sidecar is reached over the shared netns @ 127.0.0.1.
export const meiliPort = 7700

// PostgreSQL default port. The postgres:16-alpine image listens on 5432.
export const pgPort = 5432

// Sentinel used by the "Set Primary URL" action's dynamicSelect to mean
// "don't pin a host — derive NEXTAUTH_URL from the current ui address at
// runtime". Stored as empty string in store.json so main.ts's
// `primaryUrl || <derived>` fallback routes to derivation.
export const PRIMARY_URL_AUTO = '__auto__'
