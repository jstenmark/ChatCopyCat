import 'reflect-metadata'

import {type ExtensionContext, extensions} from 'vscode'

import {initExtension} from './application/extension/activation'
import {log} from './infra/logging/log-base'
import {Notify} from './infra/vscode/notification'
import {extId, extPublisher} from './shared/constants/consts'
import {type IExtension} from './shared/types/types'
import {parseError} from './shared/utils/error'
export async function activate(context: ExtensionContext) {
  try {
    await initExtension(context)

    const version = (
      (extensions.getExtension<IExtension>(
        `${extPublisher}.${extId}`,
      ) as IExtension) || undefined
    )?.packageJSON?.version

    log.info(`Extension initialized successfully (${extPublisher}.${extId} v${version})`)
  } catch (error) {
	  const { message, stackTrace } = parseError(error);

    if (error instanceof Error) {
      Notify.error(`Failed to activate extension: ${message} ${stackTrace}`, true, true);
    } else {
      Notify.error(`Failed to activate extension: ${String(error)}`, true, true);
	  }
  }
}
