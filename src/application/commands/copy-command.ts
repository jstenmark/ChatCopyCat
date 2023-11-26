import {TextEditor} from 'vscode'

import {getLangOpts} from '../../domain/services/inquiry-utils'
import {generateReferenceSections, generateSelectionSections} from '../../adapters/ui/editor-utils'
import {
  quickCopyManager,
  headersInClipboard,
  updateClipboardWithCopy,
} from '../../infra/clipboard'
import {ConfigStore, SemaphoreStore} from '../../infra/config'
import {ILangOpts} from '../../shared/types/types'
import {getInquiryType} from '../../adapters/ui/dialog/inquiry-dialog'
import {handleActiveDialogs} from '../../adapters/ui/dialog/dialog-utils'
import {processSymbolsWithComments} from './process-symbols-comments'
import {acitveEditorOrFocurLast} from '../../infra/vscode/editor'

export const copyCode = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const editor: TextEditor | undefined = await acitveEditorOrFocurLast()

  if (
    handleActiveDialogs() ||
    (await quickCopyManager.shouldResetClipboard(Date.now())) ||
    !editor
  ) {
    return
  }

  const inquiryType: string[] | undefined = !(await headersInClipboard()).selectionHeaderPresent
    ? await getInquiryType()
    : undefined

  const langOpts: ILangOpts = getLangOpts(editor)
  const selectionSections: string[] = generateSelectionSections(editor, langOpts)

  let referenceSections = undefined
  if(ConfigStore.instance.get('enableReferenceCopy')) {
    const references = await processSymbolsWithComments(editor) ?? []
    referenceSections = generateReferenceSections(references)
  }

  await updateClipboardWithCopy(inquiryType, selectionSections, referenceSections, langOpts)
  await SemaphoreStore.instance.setDialogState(false)
}
