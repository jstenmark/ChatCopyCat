// selectionUtils.ts
import * as vscode from 'vscode'
import { IContentSection, ILangOpts } from '../common'
import { getDocumentPath } from '../utils'
import { getContentSection } from './inquiry-template'

/**
 * Generates content sections from the selections in a text editor.
 * If there are no selections, it uses the entire content of the editor.
 *
 * @param editor The text editor.
 * @param langOpts Language options for the editor.
 * @param relativePathOrBasename The relative path or basename of the file in the editor.
 * @returns An array of content sections.
 */
export function generateSelectionSections(
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
): string[] {
  const relativePathOrBasename: string = getDocumentPath(editor)

  if (editor.selections.some(selection => !selection.isEmpty)) {
    return editor.selections
      .filter(selection => !selection.isEmpty)
      .map(selection => getContentSection(selection, editor, langOpts, relativePathOrBasename))
      .filter(section => section.selectionSection.length > 0)
      .map(section => section.selectionSection)
  } else {
    const { selectionSection }: IContentSection = getContentSection(
      undefined,
      editor,
      langOpts,
      relativePathOrBasename,
    )
    return [selectionSection]
  }
}
