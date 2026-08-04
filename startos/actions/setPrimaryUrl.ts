import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { PRIMARY_URL_AUTO } from '../utils'

const { InputSpec, Value } = sdk

// The dynamicSelect builder enumerates the **current** non-local hostnames of
// the `ui` interface as full origin URLs. It runs when the form opens, so the
// list reflects whatever addresses (LAN / Tor / clearnet) are reachable at
// that moment.
const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const iface = await sdk.serviceInterface
      .getOwn(effects, 'ui', (i) => i)
      .once()
    const origins: string[] =
      iface?.addressInfo?.nonLocal.format('urlstring') ?? []

    const values: Record<string, string> = {
      [PRIMARY_URL_AUTO]: i18n('Auto (derive from current address)'),
    }
    for (const origin of origins) values[origin] = origin

    const stored = await storeJson.read((s) => s.primaryUrl).once()
    const defaultKey =
      stored && origins.includes(stored) ? stored : PRIMARY_URL_AUTO

    return {
      name: i18n('Choose a host'),
      description: i18n(
        'Pin the host origin Linkwarden advertises as NEXTAUTH_URL. Only required when you use SSO/OAuth, because the OAuth callback URL must match your external domain. For plain password login the origin is derived automatically, so you can ignore this action.',
      ),
      warning: null,
      default: defaultKey,
      values,
    }
  }),
})

// Pins (or unpins) the origin Linkwarden uses for NEXTAUTH_URL. Selecting
// "Auto" clears the pin so main.ts derives the origin from the ui host at
// runtime; selecting a concrete host stores it verbatim. The store write is
// reactive, so setupMain rebuilds the linkwarden daemon with the new
// NEXTAUTH_URL without a manual restart.
export const setPrimaryUrl = sdk.Action.withInput(
  'set-primary-url',
  {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Pin the host origin Linkwarden advertises as NEXTAUTH_URL. Only required when you use SSO/OAuth, because the OAuth callback URL must match your external domain. For plain password login the origin is derived automatically, so you can ignore this action.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async ({ effects }) => {
    const stored = await storeJson.read((s) => s.primaryUrl).once()
    return { url: stored || PRIMARY_URL_AUTO }
  },
  async ({ effects, input }) => {
    const origin = input.url === PRIMARY_URL_AUTO ? '' : input.url
    await storeJson.merge(effects, { primaryUrl: origin })

    return {
      version: '1',
      title: i18n('Primary URL'),
      message: i18n(
        'Primary URL updated. The service restarts automatically to pick up the new host.',
      ),
      result: {
        type: 'single',
        name: i18n('Primary URL'),
        description: null,
        value: origin || i18n('Auto (derive from current address)'),
        masked: false,
        copyable: false,
        qr: false,
      },
    }
  },
)
