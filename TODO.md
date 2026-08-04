# TODO

Deferred items + the verification checklist for this v1. The implementation
plan lives in `plan.md`; the SDK is pinned to `1.5.3` (see `AGENTS.md` and the
workspace `AGENTS.local.md`).

## Pending verification (must run on a real StartOS 0.4.0-beta.9 box)

A clean `tsc` + `s9pk pack` does NOT prove the service runs. From `plan.md` §9:

- [ ] `make x86 install` builds + installs `linkwarden.s9pk`.
- [ ] **Install completes**. Watch for the SDK-2.x "install stuck" symptom
      (`container ID = N/A`, never created) — if seen, the SDK is wrong,
      re-pin `1.5.3`. (Verified pinned: `node_modules/@start9labs/start-sdk`
      `package.json` `"version"` = `1.5.3`.)
- [ ] `postgres` + `meilisearch` daemons go green; `linkwarden` green after
      migrations (logs: `prisma migrate deploy` succeeds, `next start`).
- [ ] Open the web UI → **register the first account** → log in → confirm
      admin (create a collection, add a link, archive a link → verify a
      screenshot/file lands under `/data/data` on the `main` volume).
- [ ] Run **Disable Registration** → confirm the **registration API rejects**
      new signups (the "Register" button may still render — known cosmetic).
      Re-enable to confirm the toggle works both ways.
- [ ] **Backup** → fresh install → **restore** → confirm data + accounts +
      search index survive and the trio restarts cleanly.
- [ ] Restart the service → daemons come back up (migrations idempotent).
- [ ] (If feasible) test an SSO/OAuth callback against a pinned Primary URL.

## Open risks from `plan.md` §12

- [ ] **`useEntrypoint()` with a CMD-only image.** spliit (Next.js image) uses
      it OK — confirm first boot runs migrations + `next start` here. Fallback:
      the literal CMD argv from the upstream Dockerfile (in `README.md`).
      #1 runtime risk.
- [ ] **First registrant = admin?** `NEXT_PUBLIC_ADMIN=1` is set; confirm id 1
      is the first user post-`prisma migrate deploy` (check the DB after first
      boot).
- [ ] **NEXTAUTH_URL behind proxy.** Validate a real password login + an OAuth
      callback. Auto-derive handles boot; the pin action is for SSO users.
- [ ] **`NEXT_PUBLIC_*` build-time.** Toggle is server-secure; verify the
      registration endpoint actually rejects when disabled.
- [ ] **Reactivity of `sdk.serviceInterface.getOwn(...).const()` in `main.ts`.**
      Confirm setupMain re-runs when a gateway is enabled/disabled so
      `NEXTAUTH_URL` follows. If not, the **Set Primary URL** action is the
      fallback source of truth.
- [ ] **Backup size** — `/data/data` can grow; switch that one volume to
      `.addSync` (incremental rsync) if it balloons.

## Future work

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
