import * as vscode from 'vscode'
import {
  generateCodeSnippetSection,
  generateDiagnosticsSection,
  generateFileMetadataSection,
  generateSelectionMetadataSection,
  getInquiry,
} from '../inquiry/inquiry-template'
import { getInquirtyDescription, getInquiryType, inputBoxManager, quickPickManager } from '../ui/dialog-template'
import { clipboardStatusBar } from '../ui/status-dialog'
import { SectionType, metadataHeader } from '../utils/consts'
import { getDiagnostics } from '../utils/diagnostic-utils'
import { getRelativePathOrBasename } from '../utils/file-utils'
import { getLangOpts } from '../utils/lang-utils'
import { debounce, detectSectionType } from '../utils/section-utils'
import { ILangOpts } from '../utils/types'
import { copyToClipboard, readFromClipboard, showNotification } from '../utils/vsc-utils'

let quickCopyCount = 0
const quickCopyResetInterval = 500
let lastCopyTimestamp: number
const resetQuickCopy = debounce(() => (quickCopyCount = 0), quickCopyResetInterval)

/**
 * Handles the logic for copying text from the editor to the clipboard.
 * If this function is triggered twice in quick succession, it will clear the clipboard.
 */
export const copy = async (): Promise<void> => {
  if (!vscode?.window?.state?.focused) {
    return
  }
  const editor: vscode.TextEditor = vscode.window.activeTextEditor!
  if (quickPickManager.isActive() || inputBoxManager.isActive()) {
    ;(quickPickManager.isActive() ? quickPickManager : inputBoxManager).close()
    return
  }

  const now = Date.now()
  quickCopyCount = now - lastCopyTimestamp < quickCopyResetInterval ? quickCopyCount + 1 : 1
  lastCopyTimestamp = now
  if (quickCopyCount >= 2) {
    await clipboardStatusBar.setClipboardEmpty()
    return resetQuickCopy()
  }

  const currentClipboardContent: string = await readFromClipboard()
  const headerIsInClipboard = currentClipboardContent.includes(metadataHeader)

  let inquiryType: string[] = []
  let inquiryDescription: string[] = []
  if (!headerIsInClipboard) {
    ;[inquiryType, inquiryDescription] = await Promise.all([getInquiryType(), getInquirtyDescription()])
  }

  const resource: vscode.Uri = editor.document.uri
  const fsPath: vscode.Uri['fsPath'] = resource.fsPath
  const workspaceFolderFsPath = vscode.workspace.getWorkspaceFolder(resource)?.uri.fsPath
  const relativePathOrBasename: string = getRelativePathOrBasename(fsPath, workspaceFolderFsPath)

  const handledSelections: string[] = []

  const fileContent = editor.selection.isEmpty ? editor.document.getText() : undefined
  const fileContentSectionType: SectionType = detectSectionType(editor)
  const fileContentDiagnostics = getDiagnostics(editor.document, editor.selection)
  let diagnosticsCount = fileContent ? fileContentDiagnostics.length : 0

  const langOpts: ILangOpts = getLangOpts(editor)
  for (const selection of editor.selections) {
    const textContent = editor.document.getText(selection)
    const textContentDiagnostics = getDiagnostics(editor.document, selection)
    diagnosticsCount += textContentDiagnostics.length

    const selectionMetadata = generateSelectionMetadataSection(editor.selections.length > 1 ? undefined : relativePathOrBasename, textContentDiagnostics.length)

    const diagnosticsSection = textContentDiagnostics.length > 0 ? generateDiagnosticsSection(textContentDiagnostics, selection) : ''
    const codeSnippetSection = generateCodeSnippetSection(textContent, selection, langOpts)
    const inquiry = getInquiry(selectionMetadata + '\n', codeSnippetSection + '\n', diagnosticsSection + '\n').trim()

    // Append the generated inquiry for the current selection
    handledSelections.push(inquiry)
    clipboardStatusBar.incrementCount()
  }
  const fileMetadataSection = generateFileMetadataSection(
    relativePathOrBasename,
    editor.selections.length,
    inquiryType,
    inquiryDescription,
    fileContentSectionType,
    diagnosticsCount,
    headerIsInClipboard,
  )
  let res
  if (currentClipboardContent === '') {
    res = fileMetadataSection.trimEnd() + handledSelections.join('\n')
  } else {
    res = currentClipboardContent.trim() + '\n' + fileMetadataSection + handledSelections.join('\n')
  }
  const success = await copyToClipboard(res)
  const messagePrefix = headerIsInClipboard ? 'Appended to' : 'Copied to'
  await showNotification(success ? 'info' : 'error', `ChatCopyCat: ${messagePrefix} clipboard.`)
}
