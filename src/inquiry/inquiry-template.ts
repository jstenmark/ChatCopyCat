import * as vscode from 'vscode'

import { SectionType, metadataHeader } from '../utils/consts'
import { ILangOpts } from '../utils/types'
import { handleFileLanguageId } from './handlers'

export function generateSelectionMetadataSection(fileName: string | undefined, problemCount: number): string {
  let metadata = '\n'
  if (fileName) {
    metadata += `## Selection ${fileName}\n`
  }
  if (problemCount > 0) {
    metadata += `- Problem Count: ${problemCount}\n`
  }
  return metadata
}

export function generateFileMetadataSection(
  fileName: string | undefined,
  selectionsCount: number,
  inquiryTypes: string[] | undefined,
  inquiryDescripton: string[] | undefined,
  sectionType: SectionType,
  problemCount: number,
  headerIsInClipboard: boolean,
): string {
  const inquiryTypeEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('inquiryType')
  const inquiryDescriptionEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('inquiryDescription')
  const metadata: string[] = !headerIsInClipboard ? [metadataHeader] : []
  metadata.push(`- File: ${fileName}`)
  metadata.push(`- Selection type: ${sectionType}`)
  metadata.push(`- Selection count: ${selectionsCount}`)
  metadata.push(`- Problem Count: ${problemCount}`)

  if (inquiryTypes && inquiryTypes.length > 0 && inquiryTypeEnabled) {
    const questionNames = inquiryTypes.join(',').trim()
    metadata.push(`- Type: ${questionNames}`)
  }

  if (inquiryDescripton && inquiryDescripton.length > 0 && inquiryDescriptionEnabled) {
    const additionalInfoContent = inquiryDescripton.join(', ').trim()
    metadata.push(`- Description: ${additionalInfoContent}`)
  }
  return metadata.join('\n')
}
export function generateCodeSnippetSection(selectionText: string, selection: vscode.Selection, langOpts: ILangOpts): string {
  return `
- Language: ${langOpts.language}
\`\`\`Ln:${selection.start.line}
${handleFileLanguageId(selectionText, langOpts).trim()}
\`\`\``
}

export function generateDiagnosticsSection(diagnostics: vscode.Diagnostic[], selection: vscode.Selection): string {
  const baseLine = selection.start.line
  const strippedDiagnostics = diagnostics
    .map(diagnostic => {
      const { source, message, range } = diagnostic
      const rangeStr = `${range.start.line - baseLine}:${range.start.character}-${range.end.line - baseLine}:${range.end.character}`
      return `${source},\t${rangeStr}\t${message}`
    })
    .join('\n')
    .trim()

  return `## Problems (source,startline:startchar-endline:endchar message)\n${strippedDiagnostics}\n`
}
export function getInquiry(metadataSection: string, codeSnippetSection: string, diagnosticsSection: string): string {
  return `${metadataSection}${codeSnippetSection}${diagnosticsSection}`
}
