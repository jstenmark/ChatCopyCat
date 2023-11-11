import * as vscode from 'vscode'

export async function copyDefinitions(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    await vscode.window.showErrorMessage('No active editor found!')
    return
  }
  const doc = editor.document
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    doc.uri,
  )

  if (!symbols) {
    await vscode.window.showInformationMessage('No symbols found!')
    return
  }

  const allDefinitions: string[] = symbols.map(symbol => doc.getText(symbol.range))

  await vscode.env.clipboard.writeText(allDefinitions.join('\n\n'))
  await vscode.window.showInformationMessage(
    `Copied ${allDefinitions.length} definitions to clipboard.`,
  )
}
