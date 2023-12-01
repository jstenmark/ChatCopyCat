import {activeEditorOrFocusLast} from '../../infra/vscode/editor'
import {ConfigStore, SemaphoreService} from '../../infra/config'
import {generateReferenceSections, generateSelectionSections} from '../../adapters/ui/editor-utils'
import {getInquiryType} from '../../adapters/ui/components/inquiry-dialog'
import {getLangOpts} from '../../infra/vscode/editor'
import {handleActiveDialogs} from '../../adapters/ui/dialog/dialog-utils'
import {ILangOpts} from '../../shared/types/types'
import {processSymbolsWithComments} from './process-symbols-comments'
import {TextEditor} from 'vscode'

import {
  quickCopyManager,
  headersInClipboard,
  updateClipboardWithCopy,
} from '../../infra/clipboard'
import {getContentConfig} from '../../domain/models/inquiry-template'

export const copyCode = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const editor: TextEditor | undefined = await activeEditorOrFocusLast()

  if (
    handleActiveDialogs() ||
    (await quickCopyManager.shouldResetClipboard(Date.now())) ||
    !editor
  ) {
    return
  }

  const config = getContentConfig()

  const inquiryType: string[] | undefined = !(await headersInClipboard()).selectionHeaderPresent
    ? await getInquiryType(config)
    : undefined

  const langOpts: ILangOpts = getLangOpts(editor)
  const selectionSections: string[] = generateSelectionSections(editor, langOpts, config)

  let referenceSections = undefined
  if(ConfigStore.instance.get('enableReferenceWithCopy')) {
    const references = await processSymbolsWithComments(editor,config) ?? []
    referenceSections = generateReferenceSections(references,config)
  }

  await updateClipboardWithCopy(inquiryType, selectionSections, referenceSections, langOpts,config)
  await SemaphoreService.setDialogState(false)
}
