import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { primaryUrl } from './primaryUrl'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'ui')
  const origin = await multi.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: uiPort,
  })
  const preferredLauncherAddress = await primaryUrl.bestUsable(effects).const()

  const ui = sdk.createInterface(effects, {
    name: i18n('Web Interface'),
    id: 'ui',
    description: i18n(
      'Collaborative bookmark manager — collect, archive (screenshots, PDFs, readability), and full-text-search your links.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
    preferredLauncherAddress,
  })

  return [await origin.export([ui])]
})
