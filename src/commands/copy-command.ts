import * as vscode from 'vscode'
import { IContentSection } from '../common/types'
import { getInquiryType, inputBoxManager, quickPickManager } from '../dialog/dialog-component'
import { getContentSection, getMetadataSection } from '../inquiry/inquiry-template'

import { metadataHeader } from '../common/consts'
import { ILangOpts } from '../common/types'
import { onDialogClose } from '../config/store-util'
import { clipboardManager } from '../extension'
import { log } from '../logging/log-manager'
import { getRelativePathOrBasename } from '../utils/file-utils'
import { debounce, getLangOpts } from '../utils/lang-utils'

let quickCopyCount = 0
const quickCopyResetInterval = 500
let lastCopyTimestamp: number = Date.now()
const resetQuickCopy = debounce(() => {
  quickCopyCount = 0
  log.debug('reset quick copy')
}, quickCopyResetInterval)

export const copy = async (): Promise<void> => {
  if (!vscode?.window?.state?.focused) {
    log.debug('Window is not in focus!')
    return
  }
  const editor: vscode.TextEditor = vscode.window.activeTextEditor!
  if (quickPickManager.isActive()) {
    quickPickManager.close()
    log.debug('closing inputBoxk')
  } else if (inputBoxManager.isActive()) {
    quickPickManager.close()
    log.debug('closing quickPick')
    return
  } else {
    log.debug('No active dialogs to close')
  }

  const now = Date.now()
  if (now - lastCopyTimestamp < quickCopyResetInterval) {
    quickCopyCount++
    if (quickCopyCount >= 2) {
      log.debug('reset clipboard before reset quick copy clal')
      await clipboardManager.resetClipboard()
      resetQuickCopy()
      return
    }
  } else {
    quickCopyCount = 1
  }
  lastCopyTimestamp = now
  log.debug('[CLIPBOARD_REOAD] :' + lastCopyTimestamp)
  const currentClipboardContent: string = await clipboardManager.readFromClipboard()
  const headerIsInClipboard: boolean = currentClipboardContent.includes(metadataHeader)

  const inquiryType: string[] | undefined = !headerIsInClipboard
    ? await getInquiryType()
    : undefined
  log.debug('[INQUIRY]->RESULT=' + JSON.stringify(inquiryType))

  const resource: vscode.Uri = editor.document.uri
  const fsPath: vscode.Uri['fsPath'] = resource.fsPath
  const workspaceFolderFsPath = vscode.workspace.getWorkspaceFolder(resource)?.uri.fsPath
  const relativePathOrBasename: string = getRelativePathOrBasename(fsPath, workspaceFolderFsPath)

  const langOpts: ILangOpts = getLangOpts(editor)
  const selectionSections: string[] = editor.selections.map((selection: vscode.Selection) => {
    const { selectionSection }: IContentSection = getContentSection(
      selection,
      editor,
      langOpts,
      relativePathOrBasename,
    )
    return selectionSection
  })
  const oldClipboardContent = `${
    currentClipboardContent.length === 0 ? undefined : currentClipboardContent + '\n'
  }`
  const fileMetadataSection = getMetadataSection(inquiryType, headerIsInClipboard)
  const trimmedOldClipboardContent =
    oldClipboardContent && headerIsInClipboard ? oldClipboardContent.trim() : ''

  const inquiry = `${trimmedOldClipboardContent}${fileMetadataSection}${selectionSections.join(
    '\n',
  )}`
  log.debug('[END_OF_HELL]->' + JSON.stringify(inquiryType))
  await clipboardManager.copyToClipboard(inquiry)
  await onDialogClose()
}
