import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { adminUserId, databaseUrl } from '../utils'

// Runs against the live database rather than the volume: Postgres is a sidecar,
// so it is only reachable while the service is running.
export const resetPassword = sdk.Action.withoutInput(
  'reset-password',

  async () => ({
    name: i18n('Reset Admin Password'),
    description: i18n(
      'Generate a new password for the administrator account. Use this if you are locked out of the web interface.',
    ),
    warning: i18n(
      'This replaces the administrator password with a new random one. Anyone still signed in stays signed in.',
    ),
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,1-9',
      len: 22,
    })

    const pgPassword = await storeJson.read((st) => st.pgPassword).once()
    if (!pgPassword) throw new Error('No pgPassword found in store.json')

    let username = ''
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'linkwarden' },
      null,
      'reset-password',
      async (sub) => {
        const script = `const bcrypt=require('/data/node_modules/bcrypt');const {PrismaClient}=require('/data/node_modules/@prisma/client');const p=new PrismaClient();(async()=>{const u=await p.user.findUnique({where:{id:${adminUserId}}});if(!u){console.error('NOUSER');process.exit(2)}await p.user.update({where:{id:u.id},data:{password:bcrypt.hashSync('${password}',10)}});process.stdout.write(u.username||u.email||'');await p.$disconnect()})().catch(e=>{console.error(e.message);process.exit(3)})`

        const res = await sub.exec(['node', '-e', script], {
          cwd: '/data',
          env: { DATABASE_URL: databaseUrl(pgPassword) },
        })

        if (res.exitCode === 2) {
          throw new Error(
            'No administrator account exists yet. Open the web interface and register your account first.',
          )
        }
        if (res.exitCode !== 0) {
          throw new Error(
            `Failed to reset the password: ${res.stderr.toString()}`,
          )
        }
        username = res.stdout.toString().trim()
      },
    )

    return {
      version: '1',
      title: i18n('Admin Password Reset'),
      message: i18n(
        'The administrator password has been reset. Save these credentials somewhere safe — they are shown once.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: username,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
