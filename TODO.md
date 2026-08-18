# TODO

Deferred items + the verification checklist. The SDK is pinned to `2.0.9` (see
`AGENTS.md` and the workspace `AGENTS.local.md`).

## Verification status (StartOS 0.4.0.1 box, `2.16.0:0`, 2026-08-13)

A clean `tsc` + `s9pk pack` does NOT prove the service runs. Verification checklist:

- [x] `make x86 install` builds + installs `linkwarden.s9pk`.
- [x] **Update path, not just fresh install:** upgraded in place from a live
      `2.15.1:0` install carrying 1 user / 2 links / 1 collection / 11 files
      under `/data/data`. All survived; `/data/apps/web/package.json` reports
      `v2.16.0` and `/api/v1/config` `INSTANCE_VERSION: "v2.16.0"`. Logs:
      `97 migrations found in prisma/migrations` → `No pending migrations to
      apply.`
- [x] `postgres` + `meilisearch` daemons come up; `linkwarden` serves
      `GET /` → 200 after the grace period. The `ECONNREFUSED 127.0.0.1:3000`
      lines during the first ~60 s are the readiness poll, not a fault.
- [x] Log in and use the app: real NextAuth credentials login as `admin`
      against the LAN HTTPS interface returned a session (`{"user":{"id":1}}`);
      authenticated `/api/v1/collections` and `/api/v1/links` returned the
      pre-existing data, and a search query returned the right link from Meili.
      Note login must be driven over the **HTTPS** interface — NextAuth issues
      `__Secure-` cookies under an `https` `NEXTAUTH_URL`, so a plain-HTTP
      loopback signin returns 200 but establishes no session.
- [x] Wrote new data on 2.16.0 (link id 3), restarted, confirmed it persisted
      in PG, stayed searchable in Meili, and the session survived. Test row
      deleted afterwards; box left with its original 1 user / 2 links.
- [x] Run **Disable Registration** → signup returned `201` while enabled and
      `400 {"response":"Registration is disabled."}` after the toggle, with
      `/api/v1/config` flipping to `DISABLE_REGISTRATION: true`. Re-enabled
      afterwards. Server-side enforcement confirmed.
- [x] Restart the service → daemons come back, migrations idempotent
      (`No pending migrations to apply.` on each boot).
- [ ] **Backup** → fresh install → **restore** → confirm data + accounts +
      search index survive and the trio restarts cleanly. **NOT RUN** on
      `2.16.0:0` (skipped deliberately: the restore half requires uninstalling
      the live install).
- [ ] (If feasible) test an SSO/OAuth callback against a pinned Primary URL.
- [ ] **arm64 is unexercised** — only `make x86` was packed and installed.

> `start-cli package action run <pkg> <action>` reads its input from **stdin**
> even for a `withoutInput` action. With no stdin it fails with
> `Deserialization Error: EOF while parsing a value at line 1 column 0` and the
> action never runs. Drive it as `echo 'null' | start-cli package action run …`.

## Open risks

- [x] **`useEntrypoint()` with a CMD-only image.** Confirmed working on
      2.16.0: the image's CMD ran `prisma migrate deploy` and then
      `concurrently` web + worker (logs show both `[web]` and `[worker]`
      output). No fallback to a literal argv needed.
- [x] **First registrant = admin?** The pre-existing `admin` is `id 1` and the
      authenticated session reports `{"user":{"id":1}}` with
      `/api/v1/config` `ADMIN: 1`.
- [x] **NEXTAUTH_URL behind proxy.** Auto-derivation produced
      `https://<lan-ip>:62527/api/v1/auth` and a real password login succeeded
      against it; `/api/v1/auth/providers` reports matching signin/callback
      URLs. OAuth callback still untested.
- [x] **`NEXT_PUBLIC_*` build-time.** Verified server-secure — see the
      Disable Registration result above. Notably `/api/v1/config` also
      reflects the flip, so it is not purely cosmetic on the client either.
- [ ] **Reactivity of `sdk.host.getOwn(...).const()` in `main.ts`.**
      Confirm setupMain re-runs when a gateway is enabled/disabled so
      `NEXTAUTH_URL` follows. If not, the **Set Primary URL** action is the
      fallback source of truth. Not exercised — no gateway was toggled.
- [ ] **Backup size** — `/data/data` can grow; switch that one volume to
      `.addSync` (incremental rsync) if it balloons.

## Future work

- [ ] **`NEXT_PUBLIC_MOBILE_APP_REDIRECT_ENABLED`** (new in upstream 2.16.0,
      optional, unset = disabled). Consumed by `/api/v1/config` with a strict
      `=== "true"` check to advertise a redirect into the native mobile app.
      Could be surfaced as a toggle action — but the `NEXT_PUBLIC_*`
      build-time-baking caveat applies, so verify it actually takes effect at
      runtime before shipping it.
- [ ] **SSO provider credentials config action(s).** Add a config action that
      writes the needed `*_CLIENT_ID` / `*_CLIENT_SECRET` /
      `NEXT_PUBLIC_*_ENABLED` triples into `store.json` and spills them onto
      the linkwarden daemon env in `main.ts`.
- [ ] **SMTP config action** using the SDK's `smtpShape` / `smtpPrefill` so
      Linkwarden can send invites.
- [ ] **AI provider keys** (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
      `OLLAMA_MODEL`, …) surfaced via actions, to enable AI auto-tagging and
      the AI extraction endpoints.
- [ ] **S3 / Spaces archive storage** config action, to offload archive bulk
      off the `main` volume.
- [ ] Reconsider `hardwareRequirements.ram` (currently `1024`) after measuring
      real RSS of PG + Meili + Next + Chromium worker headroom.
