import * as vscode from 'vscode'
import {getContentSection,codeBlock} from '../../domain/models/inquiry-template'
import {ISymbolReference} from '../../domain/models/definition-types'
import {ILangOpts, IContentSection} from '../../shared/types/types'
import {getRelativePathOrBasename} from '../../infra/system/file-utils'

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
    const {selectionSection}: IContentSection = getContentSection(
      undefined,
      editor,
      langOpts,
      relativePathOrBasename,
    )
    return [selectionSection]
  }
}

export function generateReferenceSections(references: ISymbolReference[]): string[] {
  return references.map(ref => {
    const lineNum = ref.rangeDecoratorsComments?.start.line ? ref.rangeDecoratorsComments.start.line +1 : undefined
    const lang = ref.langOpts?.language
    return ref.text ? codeBlock(ref.text, ref.path ?? '', lang, lineNum) : ''
  }).filter(section => section.length > 0)
}

export const isFullFileSelected = (editor: vscode.TextEditor): boolean => {
  return (
    editor.selection.start.isEqual(new vscode.Position(0, 0)) &&
    editor.selection.end.isEqual(editor.document.lineAt(editor.document.lineCount - 1).range.end)
  )
}

/**
 * Get diagnostics (problems) for a given document or a specific selection range.
 * @param {vscode.TextDocument} document The VSCode document to retrieve diagnostics from.
 * @param {vscode.Range} selection (Optional) The selection range to filter diagnostics. If not provided, diagnostics for the entire document will be returned.
 * @returns An array of diagnostic objects.
 */
export function getAllDiagnostics(
  document: vscode.TextDocument,
  selection: vscode.Selection | undefined,
): vscode.Diagnostic[] {
  if (typeof vscode.Selection !== 'undefined') {
    // TODO: foramt with TAP (Test Anything Protocol)
    return vscode.languages.getDiagnostics(document.uri).filter(({range}) => {
      return selection?.intersection(range)
    })
  } else {
    return vscode.languages.getDiagnostics(document.uri)
  }
}

/**
 * Gets the relative path or basename of the document in the given text editor.
 * @param editor The text editor containing the document.
 * @returns The relative path or basename of the document.
 */

export function getDocumentPath(editor: vscode.TextEditor): string {
  const resource = editor.document.uri
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource)
  return getRelativePathOrBasename(resource.fsPath, workspaceFolder?.uri.fsPath)
}

