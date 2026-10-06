import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-primary-url',
  hostId: 'ui',
  interfaceId: 'ui',
  metadata: {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Pin the host origin Linkwarden advertises as NEXTAUTH_URL. Only required when you use SSO/OAuth, because the OAuth callback URL must match your external domain. For plain password login the origin is derived automatically, so you can ignore this action.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: { name: i18n('Choose a host'), description: null },
  get: storeJson.read((s) => s.primaryUrl),
  set: (effects, url) => storeJson.merge(effects, { primaryUrl: url }),
})
