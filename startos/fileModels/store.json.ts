import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Generated once at install; the `db` volume holds a cluster initialized with
// pgPassword, so none of these may be regenerated on a restore.
const shape = z.looseObject({
  pgPassword: z.string().catch(''),
  nextAuthSecret: z.string().catch(''),
  meiliMasterKey: z.string().catch(''),
  primaryUrl: z.string().nullable().catch(null),
  disableRegistration: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
