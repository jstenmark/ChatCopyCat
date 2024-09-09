import 'reflect-metadata'

import {type ExtensionContext, extensions} from 'vscode'
import {window} from 'vscode'

import {GetSymbolReferencesCommand,type GetSymbolReferencesCommand as TGetSymbolReferencesCommand} from './application/commands/references-command'
import {initExtension} from './application/extension/activation'
import {log} from './infra/logging/log-base'
import {Notify} from './infra/vscode/notification'
import {container} from './inversify/inversify.config'
import {TYPES} from './inversify/types'
import {extId, extPublisher} from './shared/constants/consts'
import {type IExtension} from './shared/types/types'
import {errorMessage} from './shared/utils/validate'
export const logger = window.createOutputChannel('ccc')


export async function activate(context: ExtensionContext) {
  try {
    await initExtension(context)

    const version = (
      (extensions.getExtension<IExtension>(
        `${extPublisher}.${extId}`,
      ) as IExtension) || undefined
    )?.packageJSON?.version

    const refCommand = container.get<TGetSymbolReferencesCommand>(GetSymbolReferencesCommand)


    log.info(`Extension initialized successfully (${extPublisher}.${extId} v${version})`)
  } catch (error: any) {
    Notify.error(`Failed to activate extension:${errorMessage(error)}, ${error.stack}`, true, true)
  }
}

export function deactivate() {
  // Empty
}
