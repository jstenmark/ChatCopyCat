import {ExtensionContext} from 'vscode'
import {Notify} from './infra/vscode/notification'
import {errorMessage} from './shared/utils/validate'

import {registerCommands} from './application/extension/utils'
import {initExtension, registerSubscriptions} from './application/extension/activation'
import {log} from './infra/logging/log-base'


export async function activate(context: ExtensionContext) {
  try {
    const subscriptions = await initExtension(context)

    registerCommands(context)
    registerSubscriptions(context, subscriptions)
    log.info('Extension initialized sucessfully')
  } catch (error) {
    Notify.error(`Failed to activate extension:${errorMessage(error)}`,true,true)
  }
}

export function deactivate() {
  // Empty
}


