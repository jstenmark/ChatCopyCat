import * as vscode from 'vscode'

/*
const ERROR_COLOR = () => {
  // For the High Contrast Theme, editorWarning.foreground renders the text invisible.
  return vscode.workspace
    .getConfiguration("workbench")
    .colorTheme.includes("High Contrast")
    ? "#ff0000"
    : vscode.ThemeColor("editorWarning.foreground");
};
*/

export class StatusBar implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem
  private readonly clipboardStateStatusBarItem: vscode.StatusBarItem

  private readonly command = 'chatcopycat.showClipboardMenu'

  private copyCount = 0

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem('primary', vscode.StatusBarAlignment.Left, 100)
    this.statusBarItem.command = this.command
    this.statusBarItem.name = 'CatCommandCenter'
    this.statusBarItem.show()
    this.statusBarItem.tooltip = `Open menu`

    this.clipboardStateStatusBarItem = vscode.window.createStatusBarItem('showcount', vscode.StatusBarAlignment.Right, 99)
    this.clipboardStateStatusBarItem.command = this.command
    this.clipboardStateStatusBarItem.name = `CopyCats`
    this.clipboardStateStatusBarItem.show()
    this.clipboardStateStatusBarItem.tooltip = `Open menu`
  }

  dispose() {
    this.statusBarItem.hide()
    this.clipboardStateStatusBarItem.hide()
    this.statusBarItem.dispose()
    this.clipboardStateStatusBarItem.dispose()
  }

  public updateCount(count?: number | undefined) {
    this.copyCount = count ?? this.copyCount + 1
    this.clipboardStateStatusBarItem.text = `$(beaker) CopyCats: ${this.copyCount}`
    this.clipboardStateStatusBarItem.color = count !== undefined && count > 0 ? new vscode.ThemeColor('statusBarItem.errorForeground') : '#ff0000'

    this.statusBarItem.text = `$(beaker) CopyCats: ${this.copyCount}`
    this.statusBarItem.color = count !== undefined && count > 0 ? new vscode.ThemeColor('statusBarItem.errorForeground') : '#ff0000'

    //this.clipboardStateStatusBarItem.backgroundColor = count !== undefined && count > 0 ? '#ff3366' : new vscode.ThemeColor('statusBarItem.errorBackground')

    this.clipboardStateStatusBarItem.show()
    this.statusBarItem.show()
  }
}
//private updateColor(action: Action) {
//  let foreground: string | undefined
//  let background: string | undefined
//
//  // https://code.visualstudio.com/api/references/theme-color
//  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//  const colorToSet = configuration.statusBarColors[Action[action].toLowerCase()]
//
//  if (colorToSet !== undefined) {
//    if (typeof colorToSet === 'string') {
//      background = colorToSet
//    } else {
//      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//      ;[background, foreground] = colorToSet
//    }
//  }
//
//const workbenchConfiguration = configuration.getConfiguration('workbench')
//const currentColorCustomizations: Record<string, string> = workbenchConfiguration.get('colorCustomizations') ?? {}

//const colorCustomizations = { ...currentColorCustomizations }

// If colors are undefined, return to VSCode defaults
//if (background !== undefined) {
//  colorCustomizations['statusBar.background'] = background
//  colorCustomizations['statusBar.noFolderBackground'] = background
//  colorCustomizations['statusBar.debuggingBackground'] = background
//}

//if (foreground !== undefined) {
//  colorCustomizations['statusBar.foreground'] = foreground
//  colorCustomizations['statusBar.debuggingForeground'] = foreground
//}

//if (currentColorCustomizations !== colorCustomizations) {
//  workbenchConfiguration.update('colorCustomizations', colorCustomizations, true)
//}
//}
