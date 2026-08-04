import { sdk } from '../sdk'
import { setPrimaryUrl } from './setPrimaryUrl'
import { toggleRegistration } from './toggleRegistration'

export const actions = sdk.Actions.of()
  .addAction(setPrimaryUrl)
  .addAction(toggleRegistration)
