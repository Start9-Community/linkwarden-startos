export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Linkwarden': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'PostgreSQL is ready': 4,
  'Waiting for PostgreSQL': 5,
  'MeiliSearch is ready': 6,
  'Starting MeiliSearch': 7,
  // interfaces.ts
  'Collaborative bookmark manager — collect, archive (screenshots, PDFs, readability), and full-text-search your links.': 8,
  // actions/setPrimaryUrl.ts
  'Set Primary URL': 9,
  'Pin the host origin Linkwarden advertises as NEXTAUTH_URL. Only required when you use SSO/OAuth, because the OAuth callback URL must match your external domain. For plain password login the origin is derived automatically, so you can ignore this action.': 10,
  'Primary URL': 11,
  'Primary URL updated. The service restarts automatically to pick up the new host.': 12,
  'Choose a host': 13,
  'Auto (derive from current address)': 14,
  // actions/toggleRegistration.ts
  'Disable Registration': 15,
  'Registrations are currently enabled. Run this action to prevent new signups.': 16,
  'Enable Registration': 17,
  'Registrations are currently disabled. Run this action to allow new signups (for example, so another user can register).': 18,
  'Anyone with your service URL will be able to create an account until you disable registration again.': 19,
  'Registration has been disabled.': 20,
  'Registration has been enabled.': 21,
  // init/watchPrimaryUrl.ts
  'If you use SSO/OAuth, pin the Primary URL to your external domain so login callbacks resolve correctly. Password login works without this — the origin is derived automatically.': 22,
  // init/taskDisableRegistration.ts
  'Register your first account (it becomes the admin), then run "Disable Registration" to lock the service down.': 23,
  // actions/toggleRegistration.ts result title
  Registration: 24,
  // actions/resetPassword.ts
  'Reset Admin Password': 25,
  'Generate a new password for the administrator account. Use this if you are locked out of the web interface.': 26,
  'This replaces the administrator password with a new random one. Anyone still signed in stays signed in.': 27,
  'Admin Password Reset': 28,
  'The administrator password has been reset. Save these credentials somewhere safe — they are shown once.': 29,
  Username: 30,
  Password: 31,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
