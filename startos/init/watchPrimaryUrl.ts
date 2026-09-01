import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchPrimaryUrl = sdk.setupOnInit(async (effects) => {
  await sdk.action.createOwnTask(effects, setPrimaryUrl, 'optional', {
    reason: i18n(
      'If you use SSO/OAuth, pin the Primary URL to your external domain so login callbacks resolve correctly. Password login works without this — the origin is derived automatically.',
    ),
  })
})
