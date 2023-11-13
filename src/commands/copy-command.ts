import * as vscode from 'vscode'
import { headersInClipboard, quickCopyManager, updateClipboardWithCopy } from '../clipboard'
import { configStore } from '../config/config-store'
import { semaphoreStore } from '../config/semaphore-store'
import { getInquiryType, handleActiveDialogs } from '../dialog'
import { generateSelectionSections } from '../inquiry'
import { acitveEditorOrFocurLast, getLangOpts } from '../utils'
import { ILangOpts } from '../common'

export const copyCode = async (): Promise<void> => {
  await configStore.whenConfigReady()
  const editor: vscode.TextEditor | undefined = await acitveEditorOrFocurLast()

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
  await semaphoreStore.setDialogState(false)
}
