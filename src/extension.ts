import {ExtensionContext, extensions} from 'vscode'
import {Notify} from './infra/vscode/notification'
import {errorMessage} from './shared/utils/validate'

import {registerCommands} from './application/extension/utils'
import {initExtension, registerDisposables} from './application/extension/activation'
import {log} from './infra/logging/log-base'
import {extId, extPublisher} from './shared/constants/consts'
import {IExtension} from './shared/types/types'


export async function activate(context: ExtensionContext) {
  try {
    const subscriptions = await initExtension(context)

    registerCommands(context)
    registerDisposables(context, subscriptions)
    const version = (
      (extensions.getExtension<IExtension>(
        `${extPublisher}.${extId}`,
      ) as IExtension) || undefined
    )?.packageJSON?.version

    log.info(`Extension initialized successfully (${extPublisher}.${extId} v${version})`)
  } catch (error) {
    Notify.error(`Failed to activate extension:${errorMessage(error)}`, true, true)
  }
}

export function deactivate() {
  // Empty
}
