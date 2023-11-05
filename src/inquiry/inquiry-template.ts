import * as vscode from 'vscode'
import { metadataHeader } from '../utils/consts'
import { getDiagnostics as getSelectionDiagnostics } from '../utils/section-utils'
import { ILangOpts } from '../utils/types'
import { handleFileLanguageId } from './handlers'

export function getMetadataSection(inquiryTypes: string[] | undefined, headerIsInClipboard: boolean): string {
  const inquiryTypeEnabled = vscode.workspace.getConfiguration('chatcopycat').get<boolean>('inquiryType')
  const inquiryTypeSection = inquiryTypeEnabled && inquiryTypes && inquiryTypes.length > 0 ? `- Inquiry: ${inquiryTypes.join(',')}\n` : undefined
  return `${!headerIsInClipboard ? metadataHeader : '\n---'}\n` + `${inquiryTypeSection ? inquiryTypeSection + '\n' : ''}`
}

export interface IContentSection {
  selectionSection: string
  selectionDiagnostics: vscode.Diagnostic[]
}

export function getContentSection(
  selection: vscode.Selection,
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
  relativePathOrBasename: string,
): IContentSection {
  const textContent = editor.document.getText(selection)
  const textSection = handleFileLanguageId(textContent, langOpts).trimEnd()
  const selectionDiagnostics = getSelectionDiagnostics(editor.document, selection)
  const diagnosticsSection = getDiagnosticsSection(selectionDiagnostics)

  const selectionSection =
    `\`\`\`${langOpts.language} ${relativePathOrBasename} Ln:${selection.start.line}\n` +
    `${textSection}\n` +
    `\`\`\`\n` +
    `${selectionDiagnostics.length > 0 ? diagnosticsSection : ''}`

  return { selectionSection, selectionDiagnostics }
}

// @ selection
export const getDiagnosticsSection = (diagnostics: vscode.Diagnostic[]): string =>
  `- Errors: (source,aproxiemate lines, message)\n` +
  diagnostics
    .map(({ source, message, range }) => {
      const rangeStr = `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`
      return `[${source}]\tLn:${rangeStr}\t${message}`
    })
    .join('\n')
    .trimEnd()
