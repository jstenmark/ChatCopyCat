import * as vscode from 'vscode'

/**
 * Copies the provided text to the clipboard.
 * @param text - The text to be copied to the clipboard.
 * @returns True if the text was successfully copied to the clipboard, false otherwise.
 */
export function copyToClipboard(text: string): boolean {
  try {
    vscode.env.clipboard.writeText(text)
    return true
  } catch (error) {
    showErrorMessage('Failed to copy text to clipboard:' + error)
    return false
  }
}
export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message)
}
export const outputChannel = vscode.window.createOutputChannel('ChatCopyCat')
export const log = outputChannel.appendLine
