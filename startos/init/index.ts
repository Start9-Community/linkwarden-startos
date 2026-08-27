import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { watchPrimaryUrl } from './watchPrimaryUrl'
import { taskDisableRegistration } from './taskDisableRegistration'

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
