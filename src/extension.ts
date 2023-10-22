import * as vscode from "vscode";
import * as path from "path";

import { tabifyCode } from "./tabify-code";
import {
  generateCodeInquiryTemplate
} from "./inquiry/inquiry-template";
import { handleFileLanguageId } from "./handlers";
import { getFilePathOrFullPath } from "./utils/file-utils";
import {
  generateQuestionTypes,
  generateAdditionalInformationExamples,
} from "./utils/inquiry-utils";
import { getCodeSnippetLanguageInfo } from "./utils/lang-info";

async function copy() {
  const editor = vscode.window.activeTextEditor;
  const workspace = vscode.workspace;
  if (editor) {
    const fileName = editor.document.fileName;
    const fileExtension = fileName
      ? path.extname(fileName).slice(1).toLowerCase() || "txt"
      : "txt";
    const filePath =
      getFilePathOrFullPath(fileName, editor, workspace) || fileExtension;

    let selectedText = "";
    if (!editor.selection.isEmpty) {
      selectedText = editor.document.getText(editor.selection);
    }
    const codeSnippetLanguage = getCodeSnippetLanguageInfo(editor);

    selectedText = handleFileLanguageId(fileExtension, selectedText);

    const selectedType = await generateQuestionTypes();
    const additionalInfo = await generateAdditionalInformationExamples();

    const miniCode = tabifyCode(selectedText);
    const template = generateCodeInquiryTemplate(
      miniCode,
      filePath,
      codeSnippetLanguage,
      editor,
      selectedType,
      additionalInfo
    );
    const success = vscode.env.clipboard.writeText(template);
    if (!success) {
      vscode.window.showErrorMessage("Failed to copy text to clipboard.");
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  let command = vscode.commands.registerCommand("chatcopycat.copy", copy);

  context.subscriptions.push(command);
}

export function deactivate() {}
