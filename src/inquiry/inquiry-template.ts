import * as vscode from 'vscode'
import { metadataHeader } from '../common/consts'
import { IContentSection, ILangOpts } from '../common/types'
import { getAllDiagnostics } from '../utils/file-utils'
import { handleFileLanguageId } from './language-handler'

export function getMetadataSection(
  inquiryTypes: string[] | undefined,
  headerIsInClipboard: boolean,
): string {
  const inquiryTypeEnabled = vscode.workspace
    .getConfiguration('chatcopycat')
    .get<boolean>('inquiryType')
  const inquiryTypeSection =
    inquiryTypeEnabled && inquiryTypes && inquiryTypes.length > 0
      ? `- Inquiry: ${inquiryTypes.join(',')}\n`
      : undefined
  return (
    `${!headerIsInClipboard ? metadataHeader : '\n---'}\n` +
    `${inquiryTypeSection ? inquiryTypeSection + '\n' : ''}`
  )
}

export function getContentSection(
  selection: vscode.Selection,
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
  relativePathOrBasename: string,
): IContentSection {
  const textContent = editor.document.getText(selection)
  const textSection = handleFileLanguageId(textContent, langOpts).trimEnd()

  const selectionDiagnostics: vscode.Diagnostic[] = getAllDiagnostics(editor.document, selection)
  const diagnosticsSection = getDiagnosticsSection(selectionDiagnostics)

  const selectionSection =
    `\`\`\`${langOpts.language} ${relativePathOrBasename} Ln:${selection.start.line}\n` +
    `${textSection}\n` +
    `\`\`\`\n` +
    `${selectionDiagnostics.length > 0 ? diagnosticsSection : ''}`

  return { selectionSection, selectionDiagnostics }
}

export const getDiagnosticsSection = (diagnostics: vscode.Diagnostic[]): string => {
  return (
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
    .map(project => `**Workspace root:** ${project.rootPath}\n${project.files.join('\n')}`)
    .join('\n\n')
    .trim()
}
