import { TextEditor } from 'vscode'

import { headersInClipboard, quickCopyManager, updateClipboardWithCopy } from '../clipboard'
import { getInquiryType, handleActiveDialogs } from '../dialog'
import { acitveEditorOrFocurLast, generateSelectionSections, getLangOpts } from '../utils'
import { ILangOpts } from '../common'
import { SemaphoreStore, ConfigStore } from '../config'

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

  await updateClipboardWithCopy(inquiryType, selectionSections, langOpts)
  await SemaphoreStore.instance.setDialogState(false)
}
