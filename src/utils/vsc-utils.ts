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
export async function readFromClipboard(): Promise<string> {
  try {
    const content = await vscode.env.clipboard.readText()
    return content
  } catch (error) {
    showErrorMessage('Failed to read text from clipboard:' + error)
    return ''
  }
}

// To reset the clipboard, you can introduce this function:
export function resetClipboard(): boolean {
  return copyToClipboard('') // Write empty string to clipboard to clear it
}

export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message)
}

export const outputChannel = vscode.window.createOutputChannel('ChatCopyCat')
export const log = outputChannel.appendLine
export const logLine = outputChannel.appendLine
export const clear = outputChannel.clear
export const showClipboard = outputChannel.show
export const hideClipboard = outputChannel.hide
