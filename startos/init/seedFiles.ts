import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// A restore carries these forward on the `main` volume, and the `db` volume was
// initialized with pgPassword — regenerating any of them locks the service out.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
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
  })
})
