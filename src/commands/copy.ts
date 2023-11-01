import * as vscode from 'vscode'
import { generateCodeSnippetSection, generateDiagnosticsSection, generateMetadataSection, getInquiry } from '../inquiry/inquiry-template'
import { getInquirtyDescription, getInquiryType, inputBoxManager, quickPickManager } from '../ui/dialog-template'
import { clipboardStatusBar } from '../ui/status-dialog'
import { SectionType, metadataHeader } from '../utils/consts'
import { getDiagnostics } from '../utils/diagnostic-utils'
import { getRelativePathOrBasename } from '../utils/file-utils'
import { getLangOpts } from '../utils/lang-utils'
import { debounce, detectSectionType } from '../utils/section-utils'
import { ILangOpts } from '../utils/types'
import { copyToClipboard, log, readFromClipboard, showNotification } from '../utils/vsc-utils'

let quickCopyCount = 0
const quickCopyResetInterval = 500
const documentTimestamps = new Map<string, number>()
const resetQuickCopy = debounce(() => {
  quickCopyCount = 0
}, quickCopyResetInterval)
/**
 * Handles the logic for copying text from the editor to the clipboard.
 * If this function is triggered twice in quick succession, it will clear the clipboard.
 */
export const copy = async (): Promise<void> => {
  if (!vscode?.window?.state?.focused) {
    return
  }
  const editor: vscode.TextEditor = vscode.window.activeTextEditor!
  if (quickPickManager.isActive()) {
    quickPickManager.close()
    return
  } else if (inputBoxManager.isActive()) {
    inputBoxManager.close()
    return
  }

  const documentUriKey = editor.document.uri.toString()
  const now = Date.now()
  const lastCopyTimestamp = documentTimestamps.get(documentUriKey) ?? now
  const timeSinceLastCopy = now - lastCopyTimestamp
  documentTimestamps.set(documentUriKey, now)

  quickCopyCount = timeSinceLastCopy < quickCopyResetInterval ? quickCopyCount + 1 : 1
  resetQuickCopy()

  if (quickCopyCount >= 2) {
    quickCopyCount = 0
    await clipboardStatusBar.setClipboardEmpty()
    return
  }

  resetQuickCopy()
  // If two quick copies have been made, reset clipboard and counter
  if (quickCopyCount >= 2) {
    quickCopyCount = 0
    await clipboardStatusBar.setClipboardEmpty()
  }

  const currentClipboardContent: string = await readFromClipboard()
  log(`currentClipboardContent=${currentClipboardContent.length}`)
  const headerIsInClipboard = currentClipboardContent.includes(metadataHeader)
  log(`headerIsInClipboard=${headerIsInClipboard}`)

  const resource: vscode.Uri = editor.document.uri
  log(`resource=${resource.toString()}`)
  const documentIsUntitled = editor.document.isUntitled
  log(`documentIsUntitled=${documentIsUntitled}`)

  const workspaceFolderFsPath = vscode.workspace.getWorkspaceFolder(resource)?.uri.fsPath
  log(`workspaceFolderFsPath=${workspaceFolderFsPath}`)
  const fsPath: vscode.Uri['fsPath'] = editor.document.fileName
  log(`fsPath=${fsPath}`)
  const relativePathOrBasename: string = getRelativePathOrBasename(fsPath, workspaceFolderFsPath)
  log(`relativePathOrBasename=${relativePathOrBasename}`)

  const textContent: string = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection)
  log(`textContent=${textContent.length}`)
  const textContentSectionType: SectionType = detectSectionType(textContent, editor)
  log(`textContentSectionType=${textContentSectionType}`)

  const langOpts: ILangOpts = getLangOpts(editor)
  log(`langOpts=${JSON.stringify(langOpts)}`)
  const textContentDiagnostics = getDiagnostics(editor.document, editor.selection)
  log(`textContentDiagnostics=${JSON.stringify(textContentDiagnostics)}`)

  let inquiryType: string[] = []
  let inquiryDescription: string[] = []

  if (!headerIsInClipboard) {
    inquiryType = await getInquiryType()
    log(`inquiryType=${JSON.stringify(inquiryType)}`)

    inquiryDescription = await getInquirtyDescription()
    log(`inquiryDescription=${JSON.stringify(inquiryDescription)}`)
  }

  const metadataSection = generateMetadataSection(
    relativePathOrBasename,
    inquiryType,
    inquiryDescription,
    textContentSectionType,
    textContentDiagnostics.length,
    headerIsInClipboard,
  )
  const diagnosticsSection = textContentDiagnostics.length > 0 ? generateDiagnosticsSection(textContentDiagnostics) : ''
  const codeSnippetSection = generateCodeSnippetSection(textContent, langOpts)
  const inquiry = getInquiry(metadataSection.trimEnd(), codeSnippetSection.trimStart(), diagnosticsSection)

  const success = await copyToClipboard(currentClipboardContent.trimEnd() + inquiry)
  const messagePrefix = headerIsInClipboard ? 'Appended to' : 'Copied to'
  await showNotification(success ? 'info' : 'error', `ChatCopyCat: ${messagePrefix} clipboard.`)

  if (success) {
    if (headerIsInClipboard) {
      clipboardStatusBar.incrementCount()
    } else {
      clipboardStatusBar.updateCount(0)
    }
  }
}
