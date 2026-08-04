import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Surfaces an optional task pointing at the "Set Primary URL" action. This is
// only relevant for SSO/OAuth users: their OAuth callback URL must match the
// external domain registered with the IdP. For plain password login the
// origin is derived automatically in main.ts, so the task is 'optional'
// (never blocks startup) and can be dismissed.
//
// Re-registered on every startup — tasks dedupe by their default replayId, so
// this never stacks duplicates.
export const watchPrimaryUrl = sdk.setupOnInit(async (effects) => {
  await sdk.action.createOwnTask(effects, setPrimaryUrl, 'optional', {
    reason: i18n(
      'If you use SSO/OAuth, pin the Primary URL to your external domain so login callbacks resolve correctly. Password login works without this — the origin is derived automatically.',
    ),
  })
})
