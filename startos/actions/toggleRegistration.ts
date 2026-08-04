import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

// Toggles server-side registration gating. The metadata is an async function
// so the action's own name/description/warning reflect the current state
// ("Disable Registration" when open, "Enable Registration" when closed) every
// time the action list renders.
//
// NOTE: NEXT_PUBLIC_* env vars in Next.js are baked at `next build` time, so
// flipping NEXT_PUBLIC_DISABLE_REGISTRATION at runtime enforces the gate on
// the **server** (the registration API endpoint rejects signups — secure) but
// the client bundle may keep rendering the "Register" button cosmetically.
// That lag is acceptable: the endpoint itself is locked.
export const toggleRegistration = sdk.Action.withoutInput(
  'toggle-registration',
  async ({ effects }) => {
    const disabled = await storeJson
      .read((s) => s.disableRegistration)
      .const(effects)
    return disabled
      ? {
          name: i18n('Enable Registration'),
          description: i18n(
            'Registrations are currently disabled. Run this action to allow new signups (for example, so another user can register).',
          ),
          warning: i18n(
            'Anyone with your service URL will be able to create an account until you disable registration again.',
          ),
          allowedStatuses: 'any',
          group: null,
          visibility: 'enabled',
        }
      : {
          name: i18n('Disable Registration'),
          description: i18n(
            'Registrations are currently enabled. Run this action to prevent new signups.',
          ),
          warning: null,
          allowedStatuses: 'any',
          group: null,
          visibility: 'enabled',
        }
  },
  async ({ effects }) => {
    const disabled = await storeJson
      .read((s) => s.disableRegistration)
      .const(effects)
    await storeJson.merge(effects, { disableRegistration: !disabled })

    return {
      version: '1',
      title: i18n('Registration'),
      message: disabled
        ? i18n('Registration has been enabled.')
        : i18n('Registration has been disabled.'),
      result: null,
    }
  },
)
