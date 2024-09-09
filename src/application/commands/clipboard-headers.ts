import {inject, injectable} from 'inversify'

import {ClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {log} from '../../infra/logging/log-base'
import {TYPES} from '../../inversify/types'

export interface IHeadersPresent {
  selectionHeaderPresent: boolean
  fileTreeHeaderPresent: boolean
  fileTreeEndPresent: boolean
  clipboardContent: string
}

const selectionHeader = 'Selection Header'
const fileTreeHeader = 'File Tree Header'
const fileTreeEnd = 'File Tree End'

@injectable()
export class ClipboardHeadersChecker {
  constructor(@inject(TYPES.ClipboardManager) private clipboardManager: ClipboardManager) {
    log.debug('Initializing ClipboardHeadersChecker')
  }

  public async headersInClipboard(content?: string): Promise<IHeadersPresent> {
    if (!content || content.length === 0) {
      content = await this.clipboardManager.readFromClipboard()
    }

    return {
      selectionHeaderPresent: content.includes(selectionHeader),
      fileTreeHeaderPresent: content.includes(fileTreeHeader),
      fileTreeEndPresent: content.includes(fileTreeEnd),
      clipboardContent: content,
    }
  }
}
