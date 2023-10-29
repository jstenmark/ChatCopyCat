import { generateCodeInquiryTemplate, generateCodeSnippetSection } from '../inquiry/inquiry-template'
import { metadataHeader } from '../utils/consts'
import { generateQuestionTypes, generateAdditionalInformationExamples } from '../ui/dialog-template'
import { getFilePathOrFullPath } from '../utils/file-utils'
import { getCodeSnippetLanguageInfo } from '../utils/lang-utils'
import { copyStatus, copyToClipboard, log, readFromClipboard, showErrorMessage } from '../utils/vsc-utils'
import * as vscode from 'vscode'
import { debounce, detectSectionType } from '../utils/section-utils'
import { inputBoxManager, quickPickManager } from '../ui/dialog-template'

let quickCopyCount = 0
let lastCopyTimestamp = Date.now()
const resetQuickCopy = debounce(() => {
  quickCopyCount = 0
}, 500) // Reset after 5 seconds of inactivity

/**
 * Handles the logic for copying text from the editor to the clipboard.
 * If this function is triggered twice in quick succession, it will clear the clipboard.
 */
export const copy = async (): Promise<void> => {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  if (quickPickManager.isActive()) {
    quickPickManager.close()
    return
  } else if (inputBoxManager.isActive()) {
    inputBoxManager.close()
    return
  }

  const now = Date.now()
  const timeSinceLastCopy = now - lastCopyTimestamp
  lastCopyTimestamp = now

  if (timeSinceLastCopy < 500) {
    quickCopyCount += 1
  } else {
    quickCopyCount = 1
  }

  resetQuickCopy()
  // If two quick copies have been made, reset clipboard and counter
  if (quickCopyCount >= 2) {
    copyToClipboard('')
    quickCopyCount = 0
    log('Clipboard emptied...')
    copyStatus.text = 'X'
  }

  const workspace = vscode.workspace
  const currentClipboardContent = await readFromClipboard()
  const isHeaderPresent = currentClipboardContent.startsWith(metadataHeader)

  const fileName = editor.document.fileName
  const filePath = getFilePathOrFullPath(fileName, editor, workspace.getWorkspaceFolder.bind(workspace)) || ''

  const documentOrSelectedContent = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection)
  const codeSnippetLanguage = getCodeSnippetLanguageInfo(editor)

  let finalContent = ''
  // If the header is already present in clipboard content, only add a new code snippet
  if (isHeaderPresent) {
    const codeSnippetSection = generateCodeSnippetSection(detectSectionType(documentOrSelectedContent, editor), codeSnippetLanguage, documentOrSelectedContent)
    finalContent = currentClipboardContent + codeSnippetSection
    copyStatus.text = copyStatus.text + 'C'
  } else {
    // If not, generate the metadata section and the code snippet section
    const selectedType = await generateQuestionTypes()
    const additionalInfo = await generateAdditionalInformationExamples()
    finalContent = await generateCodeInquiryTemplate(documentOrSelectedContent, filePath, codeSnippetLanguage, editor, selectedType, additionalInfo)
    copyStatus.text = 'C'
  }

  if (!copyToClipboard(finalContent)) {
    showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.')
  }
}
