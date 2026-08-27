export const uiPort = 3000
export const meiliPort = 7700
export const pgPort = 5432

// The user id Linkwarden treats as administrator; must match NEXT_PUBLIC_ADMIN.
export const adminUserId = 1

export const databaseUrl = (pgPassword: string) =>
  `postgresql://postgres:${pgPassword}@127.0.0.1:${pgPort}/postgres`

// dynamicSelect key for "no pin"; stored as '' so main.ts falls through to derivation.
export const PRIMARY_URL_AUTO = '__auto__'
