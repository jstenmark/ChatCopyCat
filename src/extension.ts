import {ExtensionContext} from 'vscode'
import {Notify} from './infra/vscode/notification'
import {errorMessage} from './shared/utils/validate'

import {registerCommands} from './application/extension/utils'
import {initExtension, registerSubscriptions} from './application/extension/activation'


export async function activate(context: ExtensionContext) {
  try {
    await initExtension()
    registerCommands(context)
    registerSubscriptions(context)
  } catch (error) {
    Notify.error(`Failed to activate extension:${errorMessage(error)}`,true,true)
  }
}

export function deactivate() {
  // Empty
}


