# Linkwarden

Registration is open when you first install Linkwarden, and the first account
created becomes the administrator. Create yours before anyone else can.

## Documentation

- [Linkwarden self-hosting guide](https://docs.linkwarden.app/self-hosting/installation) — how the application is configured and what each component does.
- [Environment variables reference](https://docs.linkwarden.app/self-hosting/environment-variables) — every setting Linkwarden understands.
- [Upstream README](https://github.com/linkwarden/linkwarden#readme) — feature overview and screenshots.

## What you get on StartOS

- **One web address** serving the Linkwarden interface and its API.
- **Archiving that works out of the box.** Every link you save is captured as a
  screenshot, a PDF, and a readable text extract, by a browser bundled with the
  service.
- **Full-text search** across everything you have saved, including the archived
  page contents.
- **The database and search engine included.** Both run privately inside the
  service; there is nothing to install alongside it and no credential for you to
  manage.

## Getting set up

1. Open the **Web Interface** from your Dashboard.
2. **Register your account.** The first one created becomes the administrator of
   this instance.
3. Go back to the service page and run **Disable Registration**. StartOS shows
   this as a reminder task; running it stops anyone else from signing up.

That is everything for normal use. If you sign in with SSO, there is one more
step below.

## Using Linkwarden

### Adding other people

You do not need to reopen registration to add someone. As the administrator you
can create accounts from Linkwarden's own user management while signup stays
closed to the public. Reopen registration only if you want people to sign
themselves up.

### Single sign-on

If you sign in through an identity provider, its callback URL has to match the
domain you registered with that provider — so Linkwarden must advertise that
exact address rather than whichever one StartOS picks.

1. Open **Actions → Set Primary URL**.
2. Choose your registered domain from the list, or **Auto** to go back to
   letting StartOS decide.
3. Linkwarden restarts and uses it from then on.

The provider's own credentials — client id and secret — cannot be set from
StartOS yet, so SSO cannot be completed with this package alone.

### If you lose your password

Linkwarden cannot email you a reset link here, because email is not configured.
StartOS provides a way back instead:

1. With the service running, open **Actions → Reset Admin Password**.
2. Copy the username and password it gives you — the password is shown once.
3. Sign in with them.

This resets the administrator account only. As the administrator you can change
anyone else's password from Linkwarden's own user management.

### Actions

- **Disable / Enable Registration** — opens or closes public signup. The action
  shows whichever direction is available, so run the one you see.
- **Set Primary URL** — pins the address Linkwarden advertises, or returns it to
  **Auto**. Only needed for single sign-on.
- **Reset Admin Password** — mints a new administrator password when you are
  locked out.

## Limitations

- **Email is not configured.** Anything that would arrive by email — invitations,
  password reset links — is unavailable. Use **Reset Admin Password** if you are
  locked out of the administrator account.
- **Archives are stored on this server.** Linkwarden can offload them to
  external object storage, but this package always keeps them locally, so the
  service's disk use grows with the number of pages you archive.
