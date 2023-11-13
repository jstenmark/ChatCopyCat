import * as vscode from 'vscode'
import { IContentSection, ILangOpts, fileTreeEnd, fileTreeHeader, generateHeader } from '../common'
import { getAllDiagnostics } from '../utils'
import { handleFileLanguageId } from './language-handler'
import { configStore } from '../config'

export function getMetadataSection(
  inquiryTypes: string[] | undefined,
  headerIsInClipboard: boolean,
  langOpts: ILangOpts,
  isMultipleSelections: boolean,
): string {
  const inquiryTypeEnabled = configStore.get('inquiryType')
  const multipleSelectionns = isMultipleSelections ? ' // Multiple Selections from file' : undefined
  const inquiryTypeSection =
    inquiryTypeEnabled && inquiryTypes && inquiryTypes.length > 0
      ? `${inquiryTypes.join(',')}`
      : undefined

  return `${
    !headerIsInClipboard
      ? generateHeader(inquiryTypeSection, langOpts.language) +
        `${isMultipleSelections ? '\n - ' + multipleSelectionns : ''}`
      : `\n---${isMultipleSelections ? multipleSelectionns : ''}`
  }\n`
}

export function getContentSection(
  selection: vscode.Selection | undefined,
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
  relativePathOrBasename: string,
): IContentSection {
  const textContent = editor.document.getText(selection)
  const textSection = handleFileLanguageId(textContent, langOpts).trimEnd()

  const selectionDiagnostics: vscode.Diagnostic[] = getAllDiagnostics(editor.document, selection)
  const diagnosticsSection = getDiagnosticsSection(selectionDiagnostics)
  const showLangInPerSnippet: boolean = configStore.get('showLanguageInSnippets')

  const selectionSection =
    `\`\`\`${showLangInPerSnippet ? langOpts.language : ''} ${relativePathOrBasename} ${
      selection ? 'Ln:' + selection.start.line : ''
    }\n` +
    `${textSection}\n` +
    `\`\`\`\n` +
    `${selectionDiagnostics.length > 0 ? diagnosticsSection : ''}`

  return { selectionSection, selectionDiagnostics }
}

export const getDiagnosticsSection = (diagnostics: vscode.Diagnostic[]): string => {
  const customMessage: string = configStore.get('customDiagnosticsMessage')
  const _message: string | undefined =
    customMessage && customMessage.length > 0 ? customMessage : undefined
  return (
    `${_message && _message?.length > 0 ? _message + '\n' : ''}` +
    `- Errors: (source, approximate lines, message)\n` +
    diagnostics
      .map(({ source, message, range }) => {
        const rangeStr = `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`
        return `[${source}]\tLn:${rangeStr}\t${message}`
      })
      .join('\n')
      .trimEnd()
  )
}

/**
 * Generates a template string that lists the root path and files for each project in the input array.
 *
 * @param projectsFiles - An array of objects representing projects. Each object has a `rootPath` property (string) and a `files` property (array of strings) that contains the files for that project.
 * @returns A string that represents the template with the root path and files for each project.
 */
export function generateFilesTemplate(
  projectsFiles: { rootPath: string; files: string[] }[],
): string {
  return projectsFiles
    .map(
      project =>
        `${fileTreeHeader} ${project.rootPath}\n${project.files.join('\n')}\n${fileTreeEnd}\n`,
    )
    .join('\n\n')
    .trim()
}
