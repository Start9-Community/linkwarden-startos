import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.16.0:0',
  releaseNotes: {
    en_US: 'Initial release of Linkwarden for StartOS.',
    es_ES: 'Versión inicial de Linkwarden para StartOS.',
    de_DE: 'Erstveröffentlichung von Linkwarden für StartOS.',
    pl_PL: 'Pierwsze wydanie Linkwarden dla StartOS.',
    fr_FR: 'Version initiale de Linkwarden pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
