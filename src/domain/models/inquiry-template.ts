/* eslint  @typescript-eslint/restrict-template-expressions: 0 */

import * as vscode from 'vscode'

import {getAllDiagnostics} from '../../adapters/ui/editor-utils'
import {configStore} from '../../infra/config/config-store'
import {fileTreeEnd, fileTreeHeader, selectionHeader} from '../../shared/constants/consts'
import {type IContentSection, type ILangOpts} from '../../shared/types/types'
import {handleFileLanguageId} from '../services/language-processing-service'

export function getMetadataSection(
  inquiryTypes: string[] | undefined,
  headerIsInClipboard: boolean,
  langOpts: ILangOpts,
  isMultipleSelections: boolean,
  config: IContentConfig
): string {
  const multipleSelections = isMultipleSelections ? ' // Multiple Selections' : ''
  const inquiryTypeSection =
    config.enableInquiryMessage && inquiryTypes && inquiryTypes.length > 0
      ? inquiryTypes.join(',')
      : undefined

  return `${!headerIsInClipboard
    ? `${generateHeader(inquiryTypeSection, langOpts.language, config)}${isMultipleSelections
    ? `\n - ${multipleSelections}`
    : ''}`
    : `\n${isMultipleSelections ? multipleSelections : ''}`}\n`
}

export interface IContentConfig {
  enablePosition: boolean
  enablePath: boolean
  enableDiagnostics: boolean
  enableLanguage: boolean
  enableInquiryMessage: boolean
  enableSpacesToTabs: boolean
  enableCommentRemoval: boolean
  enableTrimming: boolean
}

export const getContentConfig = (): IContentConfig => ({
  enablePosition: configStore.get<boolean>('enablePosition'),
  enablePath: configStore.get<boolean>('enablePath'),
  enableDiagnostics: configStore.get<boolean>('enableDiagnostics'),
  enableLanguage: configStore.get<boolean>('enableLanguage'),
  enableInquiryMessage: configStore.get<boolean>('enableInquiryMessage'),
  enableSpacesToTabs: configStore.get<boolean>('enableSpacesToTabs'),
  enableCommentRemoval: configStore.get<boolean>('enableCommentRemoval'),
  enableTrimming: configStore.get<boolean>('enableTrimming'),
})

export function getContentSection(
  selection: vscode.Selection | undefined,
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
  relativePathOrBasename: string | undefined,
  config: IContentConfig
): IContentSection {
  const textContent = selection ? editor.document.getText(selection) : editor.document.getText()
  const textSection = handleFileLanguageId(textContent, langOpts, config).trimEnd()

  const selectionDiagnostics = getAllDiagnostics(editor.document, selection, config)
  const diagnosticsSection = getDiagnosticsSection(selectionDiagnostics, config)

  const selectionSection = codeBlock(
    textSection,
    relativePathOrBasename,
    config.enableLanguage ? langOpts.language : undefined,
    config.enablePosition && selection?.start.line ? selection?.start.line + 1 : undefined,
    config.enablePosition && selection?.end.line ? selection?.end.line + 1 : undefined
  )


  return {
    selectionSection: diagnosticsSection ? `${selectionSection.trimEnd()}${diagnosticsSection}` : selectionSection,
    selectionDiagnostics
  }
}

export const codeBlock = (
  code: string | string[],
  path: string | undefined,
  lang: string | undefined,
  lineNumStart: number | undefined,
  lineNumEnd: number | undefined
): string => {
  const codeText = Array.isArray(code) ? code.join('\n') : code
  const lineInfo = lineNumStart && lineNumEnd
    ? ` line="${lineNumStart.toString()}-${lineNumEnd.toString()}"`
    : ''
  const file = path ? ` file="${path}"` : ''
  return `\n\`\`\`${lang ?? ''} {${file}${lineInfo} }\n${codeText}\n\`\`\`\n`
}

const getCodeRange = (range: vscode.Range, config: IContentConfig): string | undefined =>
  !config.enablePosition
    ? undefined
    : `${range.start.line + 1}:${range.start.character + 1}-` +
    `${range.end.line + 1}:${range.end.character + 1}`

export const getDiagnosticsSection = (diagnostics: vscode.Diagnostic[] | undefined, config: IContentConfig): string | undefined => {
  if (!config.enableDiagnostics || !diagnostics || diagnostics.length === 0) {
    return undefined
  }

  const customDiagnosticsMessage = `\n${configStore.get<string>('customDiagnosticsMessage')}` || ''
  let diagnosticsSection = `${customDiagnosticsMessage}\n[Selection problems] (reporter ~location~ error)\n`

  diagnosticsSection += diagnostics.map(({source, severity, range, message}) => {
    const severityText = vscode.DiagnosticSeverity[severity]
    const positionText = config.enablePosition ? `\tLn: ${getCodeRange(range, config) ?? ''}` : ''

    return `[${source}] ${severityText}${positionText}\n${message}`
  }).join('\n').trim()

  return diagnosticsSection
}

/**
 * Generates a template string that lists the root path and files for each project in the input array.
 *
 * @param projectsFiles - An array of objects representing projects. Each object has a `rootPath` property (string) and a `files` property (array of strings) that contains the files for that project.
 * @returns A string that represents the template with the root path and files for each project.
 */
export function generateFilesTemplate(
  projectsFiles: {rootPath: string; files: string[]}[],
  config: IContentConfig
): string {
  return projectsFiles
    .map(
      project =>
        `${fileTreeHeader} ${config.enablePath ? project.rootPath : ''}\n` +
        `${project.files.join('\n')}\n` +
        `${fileTreeEnd}\n`,
    )
    .join('\n\n')
    .trim()
}

const generateHeader = (inquiryType: string | undefined, language: string | undefined, config: IContentConfig) => {
  const inquirySection = config.enableInquiryMessage && inquiryType ? `: ${inquiryType}` : ''
  const languageSection = config.enableLanguage && language ? ` - ${language}` : ''

  return inquiryType && inquiryType !== ''
    ? `${selectionHeader}${inquirySection}${languageSection}]`
    : `${selectionHeader}${languageSection}]`
}
