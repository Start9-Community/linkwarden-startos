import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Package-local state persisted alongside the service. These are values the
// service does not manage itself: generated secrets and feature toggles that
// main.ts injects as env vars.
//
// All fields use `.catch(...)` so a read of a partially-written or older
// store.json never throws — every key has a safe default.
const shape = z.object({
  // PostgreSQL superuser password. Generated once at install and reused for
  // the life of the install (survives restore via the `db` volume's own
  // contents, so on restore seedFiles deliberately does NOT regenerate it).
  pgPassword: z.string().catch(''),
  // NextAuth session/JWT signing secret. Required under NODE_ENV=production.
  nextAuthSecret: z.string().catch(''),
  // MeiliSearch master key (>=16 bytes; we use 32). Enables Meili auth — the
  // app then derives its own search/admin keys from it.
  meiliMasterKey: z.string().catch(''),
  // Pinned NEXTAUTH_URL origin (no /api/v1/auth suffix). Empty string means
  // "derive at runtime from the ui host" — see main.ts + setPrimaryUrl.
  primaryUrl: z.string().catch(''),
  // Server-side registration gating toggle. Flipped by toggleRegistration.
  disableRegistration: z.boolean().catch(false),
  // Postgres credentials are fixed to 'postgres'/'postgres' (upstream uses a
  // single 'postgres' user/db); kept in the store only so backups.ts can read
  // them when restoring.
  postgresUser: z.string().catch('postgres'),
  postgresDb: z.string().catch('postgres'),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
