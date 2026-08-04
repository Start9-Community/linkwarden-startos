import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'linkwarden',
  title: 'Linkwarden',
  license: 'AGPL-3.0-only',
  packageRepo: 'https://github.com/Start9Labs/linkwarden-startos',
  upstreamRepo: 'https://github.com/linkwarden/linkwarden',
  marketingUrl: 'https://linkwarden.app',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'db', 'search'],
  images: {
    linkwarden: {
      source: { dockerTag: 'ghcr.io/linkwarden/linkwarden:v2.15.1' },
      arch: ['x86_64', 'aarch64'],
    },
    postgres: {
      source: { dockerTag: 'postgres:16-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
    meilisearch: {
      source: { dockerTag: 'getmeili/meilisearch:v1.12.8' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // PostgreSQL + MeiliSearch + a Next.js app plus a Chromium-based archive
  // worker is a heavy stack. 1 GB is a sane lower bound; archives under
  // /data/data grow with use and are not counted here.
  hardwareRequirements: {
    ram: 1024,
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
