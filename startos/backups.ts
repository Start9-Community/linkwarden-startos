import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'

// Backs up all three volumes. The PostgreSQL data is dumped logically with
// pg_dump (faster and version-robust vs rsyncing a running cluster's data
// dir); the linkwarden archives and the MeiliSearch index are rsynced as
// whole volumes.
//
// `withPgDump` takes a whole volume ID + a pgdataPath relative to the
// mountpoint. The postgres:16-alpine image defaults PGDATA to
// /var/lib/postgresql/data; we mount the `db` volume at /var/lib/postgresql,
// so the pgdata subpath is '/data'.
//
// The password is resolved lazily (only during restore), after the `main`
// volume — which holds store.json — has been restored, so the read returns
// the original install's password rather than a pre-restore default.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'db',
    mountpoint: '/var/lib/postgresql',
    pgdataPath: '/data',
    database: 'postgres',
    user: 'postgres',
    password: async () => {
      const pw = await storeJson.read((s) => s.pgPassword).once()
      if (!pw) throw new Error('No pgPassword found in store.json')
      return pw
    },
  })
    .addVolume('main')
    .addVolume('search'),
)
