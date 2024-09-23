import * as vscode from 'vscode'

import {log} from '../../infra/logging/log-base'

export class Notify extends vscode.Disposable {
  private static log = log
  private static currentProgressToken: vscode.CancellationTokenSource | null = null

  /**
   * Show an information message.
   * @param message The message to be shown.
   */
  static info(message: string, nonBlocking = false, log = false): void {
    if (log) {
      Notify.log.info(message);
    }

    if (nonBlocking) {
      void vscode.window.showInformationMessage(message, { modal: false });
    } else {
      void vscode.window.showInformationMessage(message);
    }
  }

  /**
   * Show a warning message.
   * @param message The message to be shown.
   */
  static warn(message: string, nonBlocking = false, log = false): void {
    if (log) {
      Notify.log.warn(message)
    }

    if (nonBlocking) {
      void vscode.window.showWarningMessage(message, { modal: false });
    } else {
      void vscode.window.showWarningMessage(message);
    }
  }

  /**
   * Show an error message.
   * @param message The message to be shown.
   */
  static error(message: string, nonBlocking = false, log = false): void {
    if (log) {
      Notify.log.error(message)
    }

    if (nonBlocking) {
      void vscode.window.showErrorMessage(message, { modal: false });
    } else {
      void vscode.window.showErrorMessage(message);
    }
  }

  /**
   * Show an information message with actions (buttons).
   * @param message The message to be shown.
   * @param items A list of items representing actions.
   */
  static infoAction(message: string, ...items: string[]): Thenable<string | undefined> {
    return vscode.window.showInformationMessage(message, ...items)
  }

  /**
   * Show a warning message with actions (buttons).
   * @param message The message to be shown.
   * @param items A list of items representing actions.
   */
  static warnAction(message: string, ...items: string[]): Thenable<string | undefined> {
    return vscode.window.showWarningMessage(message, ...items)
  }

  /**
   * Show an error message with actions (buttons).
   * @param message The message to be shown.
   * @param items A list of items representing actions.
   */
  static errorAction(message: string, ...items: string[]): Thenable<string | undefined> {
    return vscode.window.showErrorMessage(message, ...items)
  }

  static async confirm(
    message: string,
    positiveAnswer: string,
    cancel: string,
    level: NotificationOptions = NotificationOptions.INFO,
  ): Promise<boolean> {
    const answer = await Notify[`${level}Action`](message, positiveAnswer, cancel)

    return answer === positiveAnswer
  }

  static async ignorable(
    message: string,
    ignoreNotification = true,
    fn: () => Promise<void>,
  ): Promise<void> {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: message,
      },
      async () => {
        if (ignoreNotification) {
          await fn()
        } else {
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: message,
            },
            fn,
          )
        }
      },
    )
  }

  static temporaryStatus(message: string, durationMs = 3000, dispose?: boolean): void {
    if (this.currentProgressToken) {
      this.currentProgressToken.cancel()
      this.currentProgressToken.dispose()
    } else
      if (dispose) {
        return
      }

    const progressToken = new vscode.CancellationTokenSource()
    this.currentProgressToken = progressToken

    void vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: message,
        cancellable: false,
      },
      async (_, token) => {
        // Wait for the duration or until cancelled
        return new Promise<void>(resolve => {
          const timer = setTimeout(() => {
            resolve()
          }, durationMs)

          token.onCancellationRequested(() => {
            clearTimeout(timer)
            resolve()
          })
        })
      },
    )


    // Reset currentProgressToken after completion
    if (this.currentProgressToken === progressToken) {
      this.currentProgressToken = null
    }
  }

  /**
   * Execute a task with a progress indicator for processing files.
   * @param title - The title of the progress indicator.
   * @param fileUris - The file URIs to process.
   * @param processFile - The function to process each file.
   */
  static async processFilesWithProgress<T>(
    title: string,
    fileUris: IPathAndUri[],
    processFile: (
      uri: vscode.Uri,
      path: string,
      reportProgress: (report: IProgressReport) => void,
      token: vscode.CancellationToken
    ) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = []
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: title,
        cancellable: true,
      },
      async (progress, token) => {
        token.onCancellationRequested(() => {
          Notify.info('User canceled the long running operation', true, true)
        })

        for (let i = 0; i < fileUris.length; i++) {
          const {uri, path} = fileUris[i]
          const increment = (i / fileUris.length) * 100
          const fileIndex = (i + 1).toString()
          progress.report({increment, message: `Processing file ${fileIndex} of ${fileUris.length.toString()}`})

          const result = await processFile(uri, path, (report) => progress.report(report), token)
          if (result) {
            results.push(result)
          }

          if (token.isCancellationRequested) {
            break
          }
        }
      }
    )
    return results
  }

  static dispose() {
    Notify.temporaryStatus('', undefined, true)
  }
}

interface IProgressReport {
  increment: number
  message: string
}

export enum NotificationOptions {
  ERROR = 'error',
  INFO = 'info',
  WARN = 'warn'
}

export interface IPathAndUri {
  uri: vscode.Uri
  path: string
}
