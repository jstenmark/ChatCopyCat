import * as vscode from 'vscode'

/**
 * Copies the provided text to the clipboard.
 * @param text - The text to be copied to the clipboard.
 * @returns True if the text was successfully copied to the clipboard, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await vscode.env.clipboard.writeText(text)
    return true
  } catch (error) {
    await showNotification('error', 'Failed :o copy text to clipboard:' + (error as Error).message || 'UNKNOWN ERROR')
    return false
  }
}
export async function readFromClipboard(): Promise<string> {
  try {
    const content = await vscode.env.clipboard.readText()
    return content
  } catch (error) {
    await showNotification('error', 'Failed to read text from clipboard:' + (error as Error).message || 'UNKNOWN ERROR')
    return ''
  }
}

export const showNotification = async (type: 'error' | 'info' | 'warning', message: string): Promise<void> => {
  const action = {
    error: vscode.window.showErrorMessage,
    info: vscode.window.showInformationMessage,
    warning: vscode.window.showWarningMessage,
  }
  await action[type](message)
}

export const outputChannel = vscode.window.createOutputChannel('ChatCopyCat')
export function log(message: string): void {
  outputChannel.appendLine(message)
}

export function clearLog(): void {
  outputChannel.clear()
}

export function showLog(): void {
  outputChannel.show()
}

export function hideLog(): void {
  outputChannel.hide()
}
