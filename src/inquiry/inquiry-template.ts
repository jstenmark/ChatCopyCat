import * as vscode from 'vscode'

import { SectionType, metadataHeader } from '../utils/consts'
import { ILangOpts } from '../utils/types'
import { handleFileLanguageId } from './handlers'

export function generateMetadataSection(
  fileName: string | undefined,
  inquiryTypes: string[] | undefined,
  inquiryDescripton: string[] | undefined,
  sectionType: SectionType,
  problemCount: number,
  headerIsInClipboard: boolean,
): string {
  const inquiryTypeEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('enableQuestionType')
  const inquiryDescriptionEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('enableAdditionalInfo')
  let metadata = !headerIsInClipboard ? `${metadataHeader}\n` : '\n'
  metadata += `- File: ${fileName}\n`
  metadata += `- Section: ${sectionType}\n`
  metadata += problemCount > 0 ? `- Problem Count: ${problemCount}\n` : ''

  if (inquiryTypes && inquiryTypes.length > 0 && inquiryTypeEnabled) {
    const questionNames = inquiryTypes.join(', ')
    metadata += `- Type: ${questionNames}\n`
  }

  if (inquiryDescripton && inquiryDescripton.length > 0 && inquiryDescriptionEnabled) {
    const additionalInfoContent = inquiryDescripton.join(', ')
    metadata += `- Description: ${additionalInfoContent}\n`
  }
  return metadata
}
export function generateCodeSnippetSection(selectionText: string, langOpts: ILangOpts): string {
  return `
\`\`\`${langOpts.language}
${handleFileLanguageId(selectionText, langOpts)}
\`\`\`\n`
}

export function generateDiagnosticsSection(diagnostics: vscode.Diagnostic[]): string {
  const strippedDiagnostics = diagnostics
    .map(({ source, message, range }: vscode.Diagnostic): string => {
      const rangeStr = `${range.start.line}:${range.start.character}-${range.end.line}:${range.start.character}`
      return `${source},${rangeStr}\t${message}`
    })
    .join('\n')

  return `[VSCodeProblems] (source,startline:startchar-endline-endchar message)\n${strippedDiagnostics}\n`
}
export function getInquiry(metadataSection: string, codeSnippetSection: string, diagnosticsSection: string): string {
  return `${metadataSection}\n${codeSnippetSection}\n${diagnosticsSection}\n`
}
