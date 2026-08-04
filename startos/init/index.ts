import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { watchPrimaryUrl } from './watchPrimaryUrl'
import { taskDisableRegistration } from './taskDisableRegistration'

// Ordering follows the packaging guide: restoreInit first (so a restore
// happens before anything else), then the version graph, interfaces, deps,
// and actions, then the package's own init scripts (seeding + tasks).
export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  seedFiles,
  watchPrimaryUrl,
  taskDisableRegistration,
)

export const uninit = sdk.setupUninit(versionGraph)
