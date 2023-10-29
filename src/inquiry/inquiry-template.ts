import * as vscode from 'vscode'
export const templateHeader = '## Code Inquiry Template'

import { detectSectionType } from '../utils/section-utils'
import { SectionType } from '../utils/consts'
import { handleFileLanguageId } from './handlers'
import { metadataHeader } from '../utils/consts'
// TODO: Fix working config
const config = vscode.workspace.getConfiguration('ChatCopyCat')
const enableQuestionType = config.get<boolean>('enableQuestionType')
const enableAdditionalInfo = config.get<string>('enableAdditionalInfo')
export function generateMinimalMetadataSection(filePath: string): string {
  return `**File:** ${filePath}\n`
}

export function generateMetadataSection(filePath: string, questionTypes: string[] | undefined, additionalInfo: string[] | undefined): string {
  let metadata = `${metadataHeader}\n- **File:** ${filePath}\n`

  if (questionTypes && questionTypes.length > 0 && enableQuestionType) {
    const questionNames = questionTypes.join(', ')
    metadata += `- **Question Type:** ${questionNames}\n`
  }

  if (additionalInfo && additionalInfo.length > 0 && enableAdditionalInfo) {
    const additionalInfoContent = additionalInfo.join(', ')
    metadata += `- **Additional Information:** ${additionalInfoContent}\n`
  }
  return metadata
}
export function generateCodeSnippetSection(sectionType: SectionType, codeSnippetLanguage: string, selectionText = ''): string {
  // Remove leading and trailing newlines
  const trimmedSelectionText = selectionText.replace(/^\n+|\n+$/g, '')

  return `**${sectionType || SectionType.CODE_SNIPPET}:**
\`\`\`${codeSnippetLanguage}
${handleFileLanguageId(codeSnippetLanguage, trimmedSelectionText)}
\`\`\`\n`
}

export async function generateCodeInquiryTemplate(
  text: string,
  filePath: string,
  codeSnippetLanguage: string,
  editor: vscode.TextEditor,
  questionType: string[],
  additionalInfo: string[],
): Promise<string> {
  const metadataSection = generateMetadataSection(filePath, questionType, additionalInfo)
  const codeSnippetSection = generateCodeSnippetSection(detectSectionType(text, editor), codeSnippetLanguage, text)

  return `${metadataSection}\n${codeSnippetSection}`
}
