import { sdk } from '../sdk'
import { resetPassword } from './resetPassword'
import { setPrimaryUrl } from './setPrimaryUrl'
import { toggleRegistration } from './toggleRegistration'

export const actions = sdk.Actions.of()
  .addAction(setPrimaryUrl)
  .addAction(toggleRegistration)
  .addAction(resetPassword)
