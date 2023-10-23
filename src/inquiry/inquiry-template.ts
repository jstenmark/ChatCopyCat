import * as vscode from 'vscode';

import { detectSectionType, SectionType } from '../utils/section-utils';

// TODO: Fix working config
const config = vscode.workspace.getConfiguration('ChatCopyCat');
const enableQuestionType = config.get<boolean>('enableQuestionType');
const enableAdditionalInfo = config.get<string>('enableAdditionalInfo');

export function generateMetadataSection(filePath: string, questionTypes: string[] | undefined, additionalInfo: string[] | undefined): string {
  let metadata = `**Metadata:**\n- **File:** ${filePath}\n`;

  if (questionTypes !== undefined && questionTypes.length > 0 && enableQuestionType) {
    metadata += `- **Question Type:** ${questionTypes.join(', ')}\n`;
  }

  if (additionalInfo !== undefined && additionalInfo.length > 0 && enableAdditionalInfo) {
    metadata += `- **Additional Information:** ${additionalInfo.join(', ')}\n`;
  }

  return metadata;
}

export function generateCodeSnippetSection(sectionType: SectionType, codeSnippetLanguage: string, selectionText: string = ''): string {
  return `
**${sectionType || SectionType.CODE_SNIPPET}:**
\`\`\`${codeSnippetLanguage}
${selectionText}
\`\`\`
`;
}

const template = (metaDataSection: any, codeSnippetSection: any) => `
## Code Inquiry Template
${metaDataSection}
---
${codeSnippetSection}
`;

export function generateCodeInquiryTemplate(
  text: string,
  filePath: string,
  codeSnippetLanguage: string,
  editor: any,
  questionType: string[] | undefined,
  additionalInfo: string[] | undefined,
): any {
  const metadataSection = generateMetadataSection(filePath, questionType, additionalInfo);
  const codeSnippetSection = generateCodeSnippetSection(detectSectionType(text, editor), codeSnippetLanguage, text);
  return template(metadataSection, codeSnippetSection);
}
