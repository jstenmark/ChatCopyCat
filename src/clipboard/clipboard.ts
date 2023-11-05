import * as vscode from 'vscode'
import { StatusBar } from '../ui/statusbar'
import { log, showNotification } from '../utils/vsc-utils'

export class Clipboard {
  private StatusBarManager: StatusBar

  constructor(StatusBarManager: StatusBar) {
    this.StatusBarManager = StatusBarManager
  }

  public async resetClipboard(): Promise<void> {
    log(`[REST]->''`)
    await Clipboard.copy('')
    showNotification('warning', 'Clipboard has been reset')

    this.StatusBarManager.updateCount(0)
  }

  public async copyToClipboard(text: string): Promise<void> {
    log(`[COPY]->${text.slice(0, 10)}`)
    await Clipboard.copy(text)
    showNotification('info', 'Copied to clipboard')
    this.StatusBarManager.updateCount()
  }

  public async readFromClipBoard(): Promise<string> {
    const text = await Clipboard.paste()
    log(`[READ]->${text.slice(0, 10)}`)
    return text
  }

  public async showClipboardMenu(): Promise<void> {
    const picks = [{ label: 'Reset Clipboard', action: this.resetClipboard.bind(this) }]
    const pick = await vscode.window.showQuickPick(picks, { placeHolder: 'Clipboard Actions' })
    if (pick?.action) {
      await pick.action()
    }
  }

  public static async copy(text: string): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(text)
    } catch (e) {
      showNotification('error', 'Failed to copy to clipboard:' + (e as Error).message || 'UNKNOWN ERROR')
    }
  }

  public static async paste(): Promise<string> {
    try {
      return await vscode.env.clipboard.readText()
    } catch (e) {
      showNotification('error', 'Failed to read text from clipboard:' + (e as Error).message || 'UNKNOWN ERROR')
      return ''
    }
  }
}
// Progress notification with option to cancel
//const showProgressNotification = vscode.commands.registerCommand('notifications-sample.showProgress', () => {
//	vscode.window.withProgress({
//		location: vscode.ProgressLocation.Notification,
//		title: "Progress Notification",
//		cancellable: true
//	}, (progress, token) => {
//		token.onCancellationRequested(() => {
//			console.log("User canceled the long running operation");
//		});
//
//		progress.report({ increment: 0 });
//
//		setTimeout(() => {
//			progress.report({ increment: 10, message: "Still going..." });
//		}, 1000);
//
//		setTimeout(() => {
//			progress.report({ increment: 40, message: "Still going even more..." });
//		}, 2000);
//
//		setTimeout(() => {
//			progress.report({ increment: 50, message: "I am long running! - almost there..." });
//		}, 3000);
//
//		const p = new Promise<void>(resolve => {
//			setTimeout(() => {
//				resolve();
//			}, 5000);
//		});
//
//		return p;
//	});
//});
