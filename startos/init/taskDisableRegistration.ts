import { toggleRegistration } from '../actions/toggleRegistration'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Reminds the user to create their admin account and then close
// registrations. Registration is enabled by default so the first registrant
// becomes the admin (Linkwarden has no CLI/API to provision an admin user);
// this task nudges the user to flip the toggle once they're set up.
//
// Install-only: the task is only meaningful on a fresh install. Idempotent by
// default replayId, so it doesn't duplicate if init re-runs.
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
