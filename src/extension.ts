import * as vscode from 'vscode'
import * as path from 'path'

import { generateCodeInquiryTemplate } from './inquiry/inquiry-template'
import { handleFileLanguageId } from './handlers'
import { getFilePathOrFullPath } from './utils/file-utils'
import { generateQuestionTypes, generateAdditionalInformationExamples } from './inquiry/inquiry-utils'
import { getCodeSnippetLanguageInfo } from './utils/lang-utils'
import { copyToClipboard, showErrorMessage, outputChannel, log } from './utils/vsc-utils'

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

    const template = generateCodeInquiryTemplate(content, filePath, codeSnippetLanguage, editor, selectedType, additionalInfo)
    const success: boolean = copyToClipboard(template)
    if (!success) {
      showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.')
    }
  }
}

const copyCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.copy', copy)
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(outputChannel)

  context.subscriptions.push(copyCommand)
  outputChannel.show(true)
  log('Hello, world!')
  log('Hello, world!')
  log('Hello, world!')
  log('Hello, world!')
}
export function deactivate() {
  if (copyCommand) {
    copyCommand.dispose()
  }
  if (copyCommand) {
    outputChannel.dispose()
  }
}
