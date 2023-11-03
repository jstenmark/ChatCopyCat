import * as vscode from 'vscode'

/**
 * Get diagnostics (problems) for a given document or a specific selection range.
 * @param {vscode.TextDocument} document The VSCode document to retrieve diagnostics from.
 * @param {vscode.Range} selection (Optional) The selection range to filter diagnostics. If not provided, diagnostics for the entire document will be returned.
 * @returns An array of diagnostic objects.
 */
export function getDiagnostics(document: vscode.TextDocument, selection: vscode.Selection): vscode.Diagnostic[] {
  const diagnostics = vscode.languages.getDiagnostics(document.uri).filter(({ range }) => {
    return selection.intersection(range)
  })

  return diagnostics
}
