import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { meiliPort, pgPort, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Linkwarden'))

  // Targeted reactive reads so a registration toggle or a Primary URL pin
  // only rebuilds the linkwarden daemon — postgres and meilisearch see no
  // change in their env and are left running.
  const pgPassword = await storeJson.read((s) => s.pgPassword).const(effects)
  const meiliKey = await storeJson.read((s) => s.meiliMasterKey).const(effects)
  const lwStore = await storeJson
    .read((s) => ({
      nextAuthSecret: s.nextAuthSecret,
      primaryUrl: s.primaryUrl,
      disableReg: s.disableRegistration,
    }))
    .const(effects)

  // seedFiles runs during init (before main), so these now exist; on restore
  // the `main` volume carries store.json forward. A missing store here means
  // something is wrong upstream — fail loudly rather than boot with empty
  // secrets.
  if (!pgPassword || !meiliKey || !lwStore) {
    throw new Error(
      'store.json is not initialized: internal secrets missing. Reinstall the package.',
    )
  }

  // NEXTAUTH_URL is mandatory under NODE_ENV=production (the image sets it).
  // A pinned primaryUrl wins; otherwise derive the origin from the `ui`
  // interface. The getOwn read is `.const()` (reactive), so setupMain re-runs
  // when the ui host's reachable addresses change (e.g. the user enables /
  // disables a gateway) and NEXTAUTH_URL follows. Prefer publicly-reachable
  // addresses (clearnet / Tor) so OAuth callback URLs land on an
  // externally-valid host, then any non-local (LAN) address, then loopback as
  // a boot fallback.
  const uiInterface = await sdk.host
    .getOwn(effects, 'ui', (h) => h?.bindings[uiPort]?.interfaces['ui'] ?? null)
    .const()
  const addressInfo = uiInterface?.addressInfo ?? null
  const firstNonLocal = (list: string[] | undefined) =>
    list && list.length ? list[0] : null
  const derivedOrigin =
    firstNonLocal(addressInfo?.public.format('urlstring')) ??
    firstNonLocal(addressInfo?.nonLocal.format('urlstring')) ??
    `http://localhost:${uiPort}`
  const chosenOrigin = lwStore.primaryUrl || derivedOrigin
  const nextAuthUrl = `${chosenOrigin}/api/v1/auth`

  const pgSub = sdk.SubContainer.of(
    effects,
    { imageId: 'postgres' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'db',
      subpath: null,
      mountpoint: '/var/lib/postgresql',
      readonly: false,
    }),
    'postgres',
  )
  const meiliSub = sdk.SubContainer.of(
    effects,
    { imageId: 'meilisearch' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'search',
      subpath: null,
      mountpoint: '/meili_data',
      readonly: false,
    }),
    'meilisearch',
  )
  const lwSub = sdk.SubContainer.of(
    effects,
    { imageId: 'linkwarden' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data/data',
      readonly: false,
    }),
    'linkwarden',
  )

  return (
    sdk.Daemons.of(effects)
      // PostgreSQL sidecar. The override args forward to `postgres
      // -c listen_addresses=127.0.0.1` (the image's entrypoint prepends
      // `postgres` when the first arg starts with `-`), so the DB binds the
      // shared netns loopback only and is reachable by linkwarden as
      // 127.0.0.1:5432.
      .addDaemon('postgres', {
        subcontainer: pgSub,
        exec: {
          command: sdk.useEntrypoint(['-c', 'listen_addresses=127.0.0.1']),
          env: {
            POSTGRES_USER: 'postgres',
            POSTGRES_PASSWORD: pgPassword,
            POSTGRES_DB: 'postgres',
          },
        },
        ready: {
          display: null,
          fn: async () => {
            const r = await pgSub.exec([
              'pg_isready',
              '-q',
              '-h',
              '127.0.0.1',
              '-U',
              'postgres',
              '-d',
              'postgres',
            ])
            return r.exitCode === 0
              ? { result: 'success', message: i18n('PostgreSQL is ready') }
              : { result: 'loading', message: i18n('Waiting for PostgreSQL') }
          },
        },
        requires: [],
      })
      // MeiliSearch sidecar. Default CMD listens on 7700; setting only
      // MEILI_MASTER_KEY mirrors the upstream compose (don't add MEILI_ENV —
      // the key-only config is verified-working and auto-derives the search
      // API keys the app uses).
      .addDaemon('meilisearch', {
        subcontainer: meiliSub,
        exec: {
          command: sdk.useEntrypoint(),
          env: { MEILI_MASTER_KEY: meiliKey },
        },
        ready: {
          display: null,
          fn: () =>
            sdk.healthCheck.checkPortListening(effects, meiliPort, {
              successMessage: i18n('MeiliSearch is ready'),
              errorMessage: i18n('Starting MeiliSearch'),
            }),
        },
        requires: [],
      })
      // Linkwarden web + worker. The image's CMD runs `prisma migrate
      // deploy` then `concurrently -k` the web server and the worker — so
      // migrations are part of startup (no oneshot) and DB + Meili must be up
      // first (requires). `useEntrypoint()` preserves that CMD; if it ever
      // fails to fire on a CMD-only image, fall back to the literal argv from
      // upstream's Dockerfile. gracePeriod 60s covers first-run migrations +
      // Next warmup. checkWebUrl (not just port-listening) catches "port
      // bound but Next still compiling".
      .addDaemon('linkwarden', {
        subcontainer: lwSub,
        exec: {
          command: sdk.useEntrypoint(),
          env: {
            NEXTAUTH_URL: nextAuthUrl,
            NEXTAUTH_SECRET: lwStore.nextAuthSecret,
            DATABASE_URL: `postgresql://postgres:${pgPassword}@127.0.0.1:${pgPort}/postgres`,
            MEILI_HOST: `http://127.0.0.1:${meiliPort}`,
            MEILI_MASTER_KEY: meiliKey,
            // NEXT_PUBLIC_* are baked at `next build` in Next.js, so flipping
            // these at runtime enforces the gate on the **server** (the
            // signup API rejects) while the client button may lag cosmetically.
            NEXT_PUBLIC_DISABLE_REGISTRATION: lwStore.disableReg
              ? 'true'
              : 'false',
            NEXT_PUBLIC_CREDENTIALS_ENABLED: 'true',
            NEXT_PUBLIC_ADMIN: '1',
          },
        },
        ready: {
          display: i18n('Web Interface'),
          gracePeriod: 60_000,
          fn: () =>
            sdk.healthCheck.checkWebUrl(
              effects,
              `http://127.0.0.1:${uiPort}/`,
              {
                successMessage: i18n('The web interface is ready'),
                errorMessage: i18n('The web interface is not ready'),
              },
            ),
        },
        requires: ['postgres', 'meilisearch'],
      })
  )
})
