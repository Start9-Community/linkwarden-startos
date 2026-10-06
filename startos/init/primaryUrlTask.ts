import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'

export const primaryUrlTask = primaryUrl.setupTask('optional', {
  reason: i18n(
    'If you use SSO/OAuth, pin the Primary URL to your external domain so login callbacks resolve correctly. Password login works without this — the origin is derived automatically.',
  ),
})
