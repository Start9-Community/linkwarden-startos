import { sdk } from '../sdk'
import { resetPassword } from './resetPassword'
import { primaryUrl } from '../primaryUrl'
import { toggleRegistration } from './toggleRegistration'

export const actions = sdk.Actions.of()
  .addAction(primaryUrl.action)
  .addAction(toggleRegistration)
  .addAction(resetPassword)
