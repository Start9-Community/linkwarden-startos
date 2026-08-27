import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'db',
    mountpoint: '/var/lib/postgresql',
    // postgres:16-alpine defaults PGDATA to <mountpoint>/data.
    pgdataPath: '/data',
    database: 'postgres',
    user: 'postgres',
    // Resolved during restore, after the `main` volume carrying store.json is back.
    password: async () => {
      const pw = await storeJson.read((s) => s.pgPassword).once()
      if (!pw) throw new Error('No pgPassword found in store.json')
      return pw
    },
  })
    .addVolume('main')
    .addVolume('search'),
)
