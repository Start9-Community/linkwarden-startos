import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { PRIMARY_URL_AUTO, uiPort } from '../utils'

const { InputSpec, Value } = sdk

// The builder runs when the form opens, so the list is whatever addresses are
// reachable at that moment.
const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const iface = await sdk.host
      .getOwn(
        effects,
        'ui',
        (h) => h?.bindings[uiPort]?.interfaces['ui'] ?? null,
      )
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
