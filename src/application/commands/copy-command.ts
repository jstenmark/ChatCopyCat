import {acitveEditorOrFocurLast} from '../../infra/vscode/editor'
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
  if(ConfigStore.instance.get('enableReferenceWithCopy')) {
    const references = await processSymbolsWithComments(editor) ?? []
    referenceSections = generateReferenceSections(references)
  }

  await updateClipboardWithCopy(inquiryType, selectionSections, referenceSections, langOpts)
  await SemaphoreService.setDialogState(false)
}
