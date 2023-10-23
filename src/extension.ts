import * as vscode from 'vscode';
import * as path from 'path';

import { generateCodeInquiryTemplate } from './inquiry/inquiry-template';
import { handleFileLanguageId } from './handlers';
import { getFilePathOrFullPath } from './utils/file-utils';
import { generateQuestionTypes, generateAdditionalInformationExamples } from './inquiry/inquiry-utils';
import { getCodeSnippetLanguageInfo } from './utils/lang-info';

async function copy() {
  const editor = vscode.window.activeTextEditor;
  const workspace = vscode.workspace;
  if (editor) {
    const fileName = editor.document.fileName;
    const fileExtension = fileName ? path.extname(fileName).slice(1).toLowerCase() || 'txt' : 'txt';
    const filePath = getFilePathOrFullPath(fileName, editor, workspace) || fileExtension;

    // TODO: Fix non selection copy selection type
    let documentOrSelectedContent = '';
    if (editor.selection.isEmpty) {
      documentOrSelectedContent = editor.document.getText();
    } else {
      documentOrSelectedContent = editor.document.getText(editor.selection);
    }

    const codeSnippetLanguage = getCodeSnippetLanguageInfo(editor);

    const selectedType = await generateQuestionTypes();
    const additionalInfo = await generateAdditionalInformationExamples();

    const content = handleFileLanguageId(fileExtension, documentOrSelectedContent);

    const template = generateCodeInquiryTemplate(content, filePath, codeSnippetLanguage, editor, selectedType, additionalInfo);
    const success = copyToClipboard(template);
    if (!success) {
      showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.');
    }
  }
}
function copyToClipboard(text: string): void {
  vscode.env.clipboard.writeText(text);
}

function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message);
}

export function activate(context: vscode.ExtensionContext) {
  let command = vscode.commands.registerCommand('ChatCopyCat.copy', copy);

  context.subscriptions.push(command);
}
export function deactivate() {}
