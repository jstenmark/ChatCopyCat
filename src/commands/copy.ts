import * as vscode from 'vscode'
import { IContentSection, getContentSection, getMetadataSection } from '../inquiry/inquiry-template'
import { getInquiryType, inputBoxManager, quickPickManager } from '../ui/dialog-template'

import { ClipboardManager } from '../extension'
import { metadataHeader } from '../utils/consts'
import { getRelativePathOrBasename } from '../utils/file-utils'
import { getLangOpts } from '../utils/lang-utils'
import { debounce } from '../utils/section-utils'
import { ILangOpts } from '../utils/types'
import { log } from '../utils/vsc-utils'

let quickCopyCount = 0
const quickCopyResetInterval = 500
let lastCopyTimestamp: number = Date.now()
const resetQuickCopy = debounce(() => {
  //;(quickPickManager.isActive() ? quickPickManager : inputBoxManager).close()
  quickCopyCount = 0
  log('reset quick copy')
}, quickCopyResetInterval)

export const copy = async (): Promise<void> => {
  if (!vscode?.window?.state?.focused) {
    log('copy is blocked')
    return
  }
  const editor: vscode.TextEditor = vscode.window.activeTextEditor!
  if (quickPickManager.isActive()) {
    quickPickManager.close()
    log('closing inputBoxk')
  } else if (inputBoxManager.isActive()) {
    quickPickManager.close()
    log('closing quickPick')
    return
  } else {
    log('No active dialogs to close')
  }

  const now = Date.now()
  if (now - lastCopyTimestamp < quickCopyResetInterval) {
    quickCopyCount++
    if (quickCopyCount >= 2) {
      log('reset clipboard before reset quick copy clal')
      await ClipboardManager.resetClipboard()
      resetQuickCopy()
      return
    }
  } else {
    quickCopyCount = 1
  }
  lastCopyTimestamp = now
  log('[PRE_READ]last copy timestamp:' + lastCopyTimestamp)
  const currentClipboardContent: string = await ClipboardManager.readFromClipBoard()
  const headerIsInClipboard: boolean = currentClipboardContent.includes(metadataHeader)

  const inquiryType: string[] | undefined = !headerIsInClipboard ? await getInquiryType() : undefined
  log('[INQUIRY]->' + JSON.stringify(inquiryType))

  if (inquiryType?.length === 0) {
    return
  }

  const resource: vscode.Uri = editor.document.uri
  const fsPath: vscode.Uri['fsPath'] = resource.fsPath
  const workspaceFolderFsPath = vscode.workspace.getWorkspaceFolder(resource)?.uri.fsPath
  const relativePathOrBasename: string = getRelativePathOrBasename(fsPath, workspaceFolderFsPath)

  const langOpts: ILangOpts = getLangOpts(editor)
  const selectionSections: string[] = editor.selections.map((selection: vscode.Selection) => {
    const { selectionSection }: IContentSection = getContentSection(selection, editor, langOpts, relativePathOrBasename)
    return selectionSection
  })
  const oldClipboardContent = `${currentClipboardContent.length === 0 ? undefined : currentClipboardContent + '\n'}`
  const fileMetadataSection = getMetadataSection(inquiryType, headerIsInClipboard)
  const trimmedOldClipboardContent = oldClipboardContent && headerIsInClipboard ? oldClipboardContent.trim() : ''

  const inquiry = `${trimmedOldClipboardContent}${fileMetadataSection}${selectionSections.join('\n')}`
  log('[END_OF_HELL]->' + JSON.stringify(inquiryType))
  await ClipboardManager.copyToClipboard(inquiry)
}
