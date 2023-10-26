import { generateCodeInquiryTemplate, generateCodeSnippetSection, metadataHeader } from '../inquiry/inquiry-template'
import { generateQuestionTypes, generateAdditionalInformationExamples } from '../inquiry/inquiry-utils'
import { getFilePathOrFullPath } from '../utils/file-utils'
import { getCodeSnippetLanguageInfo } from '../utils/lang-utils'
import { copyToClipboard, log, readFromClipboard, showErrorMessage } from '../utils/vsc-utils'
import * as vscode from 'vscode'
import { debounce, detectSectionType } from '../utils/section-utils'

let quickCopyCount = 0
let lastCopyTimestamp = Date.now()
const resetQuickCopy = debounce(() => {
  quickCopyCount = 0
}, 500) // Reset after 5 seconds of inactivity

/**
 * Closes the currently active input box and any associated quick picks in the VS Code editor.
 */
export const closeCopyInputBox = async (): Promise<void> => {
  log('Closing input')
  await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', false)
  await vscode.commands.executeCommand('workbench.action.closeQuickOpen')
}

/**
 * Handles the logic for copying text from the editor to the clipboard.
 * If this function is triggered twice in quick succession, it will clear the clipboard.
 */
export const copy = async (): Promise<void> => {
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
  }

  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
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
  } else {
    // If not, generate the metadata section and the code snippet section
    const selectedType = await generateQuestionTypes()
    const additionalInfo = await generateAdditionalInformationExamples()
    await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', false)
    finalContent = await generateCodeInquiryTemplate(documentOrSelectedContent, filePath, codeSnippetLanguage, editor, selectedType, additionalInfo)
  }

  if (!copyToClipboard(finalContent)) {
    showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.')
  }
}
