const defaultCodeSnippetLanguage = '[Specify the programming language]';

export function getCodeSnippetLanguageInfo(editor: any): string {
  return editor?.document.languageId || defaultCodeSnippetLanguage;
}
