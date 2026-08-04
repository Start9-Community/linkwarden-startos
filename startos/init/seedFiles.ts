import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// Install-only seeding of the recipe's internal secrets + defaults. These
// values live in store.json on the `main` volume.
//
// On restore, the `db` volume already contains a PostgreSQL data directory
// initialized with the original pgPassword, and the `main`/`search` volumes
// carry the other persisted state. Regenerating any secret here would make
// the restored service unable to decrypt its existing sessions, talk to its
// existing DB, or talk to its existing Meili index — so this handler is a
// no-op for every kind except 'install'.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    // 22 chars of [a-zA-Z0-9] is comfortably above Postgres' password
    // strength expectations and URL-safe when interpolated into DATABASE_URL.
    pgPassword: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 22 }),
    nextAuthSecret: utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 64,
    }),
    meiliMasterKey: utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    }),
    primaryUrl: '',
    disableRegistration: false,
    postgresUser: 'postgres',
    postgresDb: 'postgres',
  })
})
