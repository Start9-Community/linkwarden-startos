# Linkwarden

## Documentation

- [Linkwarden self-hosting guide](https://docs.linkwarden.app/self-hosting/installation) — how the Docker stack is configured upstream and what each component does.
- [Environment variables reference](https://docs.linkwarden.app/self-hosting/environment-variables) — every env var Linkwarden understands.
- [Upstream README](https://github.com/linkwarden/linkwarden#readme) — feature overview and screenshots.

## What you get on StartOS

Linkwarden on StartOS bundles the three services from upstream's
`docker-compose.yml` — the Linkwarden web/worker app, PostgreSQL, and
MeiliSearch — as three daemons sharing one localhost namespace, fronted by a
single web address.

- The **web interface** is the only exposed port (internal `3000`). Open it
  from your Dashboard to sign in, collect bookmarks, and archive links.
- **Archives** (screenshots, PDFs, and readability extracts produced by the
  bundled headless browser + `monolith`) persist in the `main` volume under
  `/data/data`. `/data/data` is where the upstream image writes them by
  default.
- **PostgreSQL** runs as a localhost sidecar; database migrations run
  automatically on every startup (`prisma migrate deploy`), so you never need
  to trigger them manually.
- **MeiliSearch** runs as a localhost sidecar and powers full-text search. Its
  master key is generated for you at install and shared with the app.

## Getting set up

> **`<service-address>`** below is the URL shown on your service's page in the
> StartOS dashboard (the "Web Interface" link).

1. Open the service from your **Dashboard**.
2. Because Linkwarden has no CLI/API to provision an admin user, **registration
   is enabled by default**. Open the web interface and **register your first
   account** — it becomes the admin.
3. Once you have an account, open the **Actions** tab (or the
   **"Disable Registration"** reminder task) and run **Disable Registration**.
   This locks new signups out at the API (server-enforced). You can re-run the
   action to enable signups again if you later want another user to register.

That's all that's required for password login. If you use **SSO / OAuth**,
there is one extra step — see below.

## Single Sign-On (SSO / OAuth) — pin the Primary URL

Linkwarden advertises `NEXTAUTH_URL` and uses it to build OAuth callback URLs.
Because a StartOS service is reachable at several addresses (LAN, Tor,
clearnet), the package **derives** `NEXTAUTH_URL` automatically from the
web interface's current public address — so password login works without any
configuration.

OAuth providers, however, validate the exact callback URL against the domain
you registered with the identity provider. For SSO you should **pin** the
Primary URL to your external domain:

1. Open **Actions → Set Primary URL**.
2. Pick your externally-registered host from the list (or **Auto** to clear a
   pin and go back to automatic derivation).
3. The service restarts automatically and `NEXTAUTH_URL` follows your choice.

SSO provider credentials themselves (`GITHUB_ID`, `GOOGLE_CLIENT_SECRET`, …)
are not yet surfaced through StartOS — set the ones you need in the action-less
path described in `README.md`'s "Not yet exposed" section until a dedicated
config action ships.

## Actions

- **Disable / Enable Registration** — toggles server-side signup gating. The
  action's own name reflects the current state, so run whichever one it
  shows. Once disabled, the registration API endpoint rejects new signups.
- **Set Primary URL** — pins (or unpins, via **Auto**) the hostname Linkwarden
  uses for `NEXTAUTH_URL`. Only needed for SSO/OAuth.

## Notes

- The "Register" button may still render in the UI right after you disable
  registration, but submitting it is rejected by the server. This is a
  cosmetic consequence of Next.js baking `NEXT_PUBLIC_*` flags at build time;
  the gate itself is enforced server-side and is secure.
- Backing up the service captures the PostgreSQL database (logical `pg_dump`),
  your archives/uploads (`main` volume), and the MeiliSearch index (`search`
  volume). Restoring brings back your accounts, collections, links, and
  archives.
