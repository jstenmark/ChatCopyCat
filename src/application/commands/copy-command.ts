
import {type TextEditor} from 'vscode'

import {handleActiveDialogs} from '../../adapters/ui/dialog/dialog-utils'
import {getInquiryType} from '../../adapters/ui/dialog/inquiry-dialog'
import {generateReferenceSections, generateSelectionSections} from '../../adapters/ui/editor-utils'
import {getContentConfig} from '../../domain/models/inquiry-template'
import {SemaphoreService} from '../../domain/services/semaphore-service'
import {type ClipboardUtils} from '../../infra/clipboard/clipboard-utils'
import {type QuickCopyManager} from '../../infra/clipboard/quickcopy-manager'
import {ConfigStore} from '../../infra/config/config-store'
import {activeEditorOrFocusLast} from '../../infra/vscode/editor'
import {getLangOpts} from '../../infra/vscode/editor'
import {container} from '../../inversify/inversify.config'
import {TYPES} from '../../inversify/types'
import {type ILangOpts} from '../../shared/types/types'
import {type ClipboardHeadersChecker} from './clipboard-headers'
import {processSymbolsWithComments} from './process-symbols-comments'

export const copyCode = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const editor: TextEditor | undefined = await activeEditorOrFocusLast()
  const quickCopyManager = container.get<QuickCopyManager>(TYPES.QuickCopyManager)

  if (
    handleActiveDialogs() ||
    (await quickCopyManager.shouldResetClipboard(Date.now())) ||
    !editor
  ) {
    return
  }

  const config = getContentConfig()
  const clipboardHeadersChecker = container.get<ClipboardHeadersChecker>(TYPES.ClipboardHeadersChecker)
  const clipboardUtils = container.get<ClipboardUtils>(TYPES.ClipboardUtils)

  const inquiryType: string[] | undefined = !(await clipboardHeadersChecker.headersInClipboard()).selectionHeaderPresent
    ? await getInquiryType(config)
    : undefined

  const langOpts: ILangOpts = getLangOpts(editor)
  const selectionSections: string[] = generateSelectionSections(editor, langOpts, config)

  let referenceSections = undefined
  if (ConfigStore.instance.get('enableReferenceWithCopy')) {
    const references = await processSymbolsWithComments(editor, config) ?? []
    referenceSections = generateReferenceSections(references, config)
  }

  await clipboardUtils.updateClipboardWithCopy(inquiryType, selectionSections, referenceSections, langOpts, config)
  await SemaphoreService.setDialogState(false)
}
