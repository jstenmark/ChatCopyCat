import * as vscode from 'vscode'
import * as path from 'path'

import { generateCodeInquiryTemplate } from './inquiry/inquiry-template'
import { handleFileLanguageId } from './handlers'
import { getFilePathOrFullPath } from './utils/file-utils'
import { generateQuestionTypes, generateAdditionalInformationExamples } from './inquiry/inquiry-utils'
import { getCodeSnippetLanguageInfo } from './utils/lang-info'

async function copy() {
  const editor = vscode.window.activeTextEditor
  const workspace = vscode.workspace
  if (editor) {
    const fileName = editor.document.fileName
    const fileExtension = fileName ? path.extname(fileName).slice(1).toLowerCase() || 'txt' : 'txt'
    const filePath = getFilePathOrFullPath(fileName, editor, workspace.getWorkspaceFolder.bind(workspace)) || fileExtension

    // TODO: Fix non selection copy selection type
    let documentOrSelectedContent = ''
    if (editor.selection.isEmpty) {
      documentOrSelectedContent = editor.document.getText()
    } else {
      documentOrSelectedContent = editor.document.getText(editor.selection)
    }

    const codeSnippetLanguage = getCodeSnippetLanguageInfo(editor)

    const selectedType = (await generateQuestionTypes()) as string[]
    const additionalInfo = (await generateAdditionalInformationExamples()) as string[]

    const content = handleFileLanguageId(fileExtension, documentOrSelectedContent)
    // Assume you have a function to convert string to IQuestionType

    const template = generateCodeInquiryTemplate(content, filePath, codeSnippetLanguage, editor, selectedType, additionalInfo)
    const success: boolean = copyToClipboard(template)
    if (!success) {
      showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.')
    }
  }
}

/**
 * Copies the provided text to the clipboard.
 * @param text - The text to be copied to the clipboard.
 * @returns True if the text was successfully copied to the clipboard, false otherwise.
 */
function copyToClipboard(text: string): boolean {
  try {
    vscode.env.clipboard.writeText(text)
    return true
  } catch (error) {
    showErrorMessage('Failed to copy text to clipboard:' + error)
    return false
  }
}

function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message)
}

export function activate(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand('ChatCopyCat.copy', copy)

  context.subscriptions.push(command)
}
export function deactivate() {}
