import { toggleRegistration } from '../actions/toggleRegistration'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Linkwarden has no CLI or API to provision an admin, so registration ships
// open and the first registrant becomes the admin.
export const taskDisableRegistration = sdk.setupOnInit(
  async (effects, kind) => {
    if (kind !== 'install') return

    await sdk.action.createOwnTask(effects, toggleRegistration, 'important', {
      reason: i18n(
        'Register your first account (it becomes the admin), then run "Disable Registration" to lock the service down.',
      ),
    })
  },
)
