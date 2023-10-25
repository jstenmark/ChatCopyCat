import { generateCodeInquiryTemplate, generateCodeSnippetSection } from '../inquiry/inquiry-template'
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

export const closeCopyInputBox = async () => {
  log('Closing input')
  await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', false)
  await vscode.commands.executeCommand('workbench.action.closeQuickOpen')
}

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
  if (quickCopyCount >= 2) {
    // If two quick copies have been made, reset clipboard and counter
    copyToClipboard('')
    quickCopyCount = 0
    log('Clipboard emptied...')
  }

  const editor = vscode.window.activeTextEditor
  const workspace = vscode.workspace
  if (editor) {
    const currentClipboardContent = await readFromClipboard()
    const isHeaderPresent = currentClipboardContent.startsWith('**Metadata:**')

    const fileName = editor.document.fileName
    const filePath = getFilePathOrFullPath(fileName, editor, workspace.getWorkspaceFolder.bind(workspace)) || ''

    const documentOrSelectedContent = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection)
    const codeSnippetLanguage = getCodeSnippetLanguageInfo(editor)

    let finalContent = ''

    // If the header is already present in clipboard content, only add a new code snippet
    if (isHeaderPresent) {
      const codeSnippetSection = generateCodeSnippetSection(
        detectSectionType(documentOrSelectedContent, editor),
        codeSnippetLanguage,
        documentOrSelectedContent,
      )
      finalContent = currentClipboardContent + codeSnippetSection
    } else {
      // If not, generate the metadata section and the code snippet section
      await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', true)
      const selectedType = (await generateQuestionTypes()) as string[]
      await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', true)
      const additionalInfo = (await generateAdditionalInformationExamples()) as string[]
      await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', false)
      finalContent = await generateCodeInquiryTemplate(documentOrSelectedContent, filePath, codeSnippetLanguage, editor, selectedType, additionalInfo)
    }

    if (!copyToClipboard(finalContent)) {
      showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.')
    }
  }
}
