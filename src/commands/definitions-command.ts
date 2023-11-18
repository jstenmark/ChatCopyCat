import { window, env, DocumentSymbol, commands } from 'vscode'

export async function copyDefinitions(): Promise<void> {
  const editor = window.activeTextEditor
  if (!editor) {
    await window.showErrorMessage('No active editor found!')
    return
  }
  const doc = editor.document
  const symbols = await commands.executeCommand<DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    doc.uri,
  )

  if (!symbols) {
    await window.showInformationMessage('No symbols found!')
    return
  }

  const allDefinitions: string[] = symbols.map(symbol => doc.getText(symbol.range))

  await env.clipboard.writeText(allDefinitions.join('\n\n'))
  await window.showInformationMessage(`Copied ${allDefinitions.length} definitions to clipboard.`)
}
