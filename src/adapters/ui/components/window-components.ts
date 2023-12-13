import * as fs from 'fs'
import * as vscode from 'vscode'
import {getProjectRootPaths} from '../../../infra/system/file-utils'
import {Validator} from '../../../shared/utils/validate'
import {Notify} from '../../../infra/vscode/notification'
import {StateStore} from '../../../infra/config'




/**
 * Displays an input box using provided options.
 * @param options - The input box configuration options.
 * @returns The string entered by the user, or undefined if input was dismissed.
 */

export function createInputBox(options: vscode.InputBoxOptions): vscode.InputBox {
  const inputBox = vscode.window.createInputBox()
  inputBox.placeholder = options.placeHolder ? options.placeHolder : undefined
  return inputBox
}
/**
 * Displays an input box using provided options.
 * @param options - The input box configuration options.
 * @returns The string entered by the user, or undefined if input was dismissed.
 */

export async function inputBox(options: vscode.InputBoxOptions): Promise<string | undefined> {
  return vscode.window.showInputBox(options)
}
/**
 * Shows a confirmation dialog requiring 'yes' as input to proceed.
 * @returns 'yes' if confirmed, otherwise undefined.
 */

export async function confirmValidateDialog(): Promise<string | undefined> {
  const answer = await inputBox({
    ignoreFocusOut: true,
    prompt: 'Are you sure?',
    validateInput: text => new Validator<string>(text)
      .isNotEmpty()
      .isConfirmationValue()
      .getInputBoxValidationMessage()

  })

  return answer?.toLowerCase() === 'yes' ? answer : undefined
}
/**
 * Opens a dialog for folder selection.
 * @returns The path of the selected folder, or undefined if no folder was selected.
 */

export async function folderDialog(): Promise<string | undefined> {
  const folder = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select new project path',
  })

  return folder ? folder[0].fsPath : undefined
}
/**
 * Opens a save dialog for file selection.
 * @returns The path of the file to be saved, or undefined if the operation was cancelled.
 */

export async function fileDialog(): Promise<string | undefined> {
  const defaultFolder = vscode.workspace.workspaceFolders ? getProjectRootPaths()![0] : ''
  const folder = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.parse(defaultFolder),
    saveLabel: 'Select mnemonic storage',
  })

  return folder ? folder.fsPath : undefined
}
/**
 * Saves the provided text to a file.
 * @param text - The text to be saved.
 * @param defaultFilename - The default name for the file.
 * @param ext - Optional file extensions for the save dialog.
 * @returns The path of the saved file, or undefined if the operation was cancelled.
 */

export async function saveTextFile(
  text: string,
  defaultFilename: string,
  ext?: Record<string, string[]>
): Promise<string | undefined> {
  const file = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultFilename),
    filters: ext,
  })

  if (file) {
    fs.writeFileSync(file.fsPath, text)
    return file.fsPath
  }

  return undefined
}

export async function showQuickPickMany<T extends vscode.QuickPickItem>(
  items: T[] | Promise<T[]>,
  options: vscode.QuickPickOptions & {canPickMany: true}
): Promise<T[] | undefined> {
  return await vscode.window.showQuickPick<T>(items, options)
}

export async function showQuickPick<T extends vscode.QuickPickItem>(
  items: T[],
  options?: vscode.QuickPickOptions | undefined
): Promise<T | undefined> {
  const defaultOptions: vscode.QuickPickOptions = {
    // matchOnDescription: true,
    ...options,
  }

  return await vscode.window.showQuickPick<T>(items, defaultOptions)
}

export interface IQuickPickItemAction extends vscode.QuickPickItem {
  action?: () => Promise<void>
  notifyMessage?: string
  notifyIgnorable?: boolean
}

/**
 * Shows a quick pick menu with the provided items and options.
 * Executes an action associated with the selected item if it exists.
 * @param items - An array of quick pick items or a promise that resolves to an array of items.
 * @param options - Configuration options for the quick pick menu.
 * @returns A promise that resolves to the selected item.
 * @throws Error if no item is selected.
 */

export async function showQuickPickAction<T extends IQuickPickItemAction>(
  items: T[] | Promise<T[]>,
  options: vscode.QuickPickOptions
): Promise<T | undefined> {
  const result = await vscode.window.showQuickPick(items, options)
  if (result === undefined) {
    return undefined
  }
  if (result.action) {
    if (result.notifyMessage) {
      await Notify.ignorable(result.notifyMessage, result.notifyIgnorable, async () => {
        if (result.action) {
          await result.action()
        }
      })
    } else {
      await result.action()
    }
  }
  return result
}

export const createQuickPick = <T extends vscode.QuickPickItem>(
  quickPickItems: T[],
  selectedItems: T[] = [],
  title: string,
  placeholder = 'Select item',
  canSelectMany = false,
  activeItem: string | undefined = undefined
) => {
  const quickPick = vscode.window.createQuickPick<T>()
  quickPick.items = quickPickItems
  quickPick.canSelectMany = canSelectMany
  quickPick.placeholder = placeholder
  quickPick.title = title
  quickPick.selectedItems = selectedItems

  if (activeItem && quickPickItems !== undefined) {
    const activeItems = quickPickItems.find(item => item.label === activeItem)
    if(activeItems) {
      quickPick.activeItems = [activeItems]
    }
  }

  return quickPick
}

export const initQuickPick = async <T extends vscode.QuickPickItem>(
  quickPick: vscode.QuickPick<T>,
  selectedItemKey: string | undefined = undefined
) => {
  quickPick.show()

  return await Promise.race([
    new Promise<readonly T[]>(resolve => quickPick.onDidAccept(() => {
      if(selectedItemKey && quickPick.selectedItems.length !== 0) {
        const activeItem = quickPick.selectedItems[0].label
        StateStore.setState<string>(selectedItemKey, activeItem)
      }
      resolve(quickPick.selectedItems)
    })
    ),
    new Promise<undefined>(resolve => quickPick.onDidHide(() => resolve(undefined))),
  ]).then(result => {
    quickPick.dispose()
    return result
  })
}

