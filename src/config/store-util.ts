import * as vscode from 'vscode'
import { log } from '../logging/log-manager'

export const SEMAPHORE_CONTEXT_KEY = 'chatcopycat:semaphoreDialogOpen'

async function setSemaphoreState(locked: boolean): Promise<void> {
  log.info(`Setting ${SEMAPHORE_CONTEXT_KEY} to ${locked}`)
  await vscode.commands.executeCommand('setContext', SEMAPHORE_CONTEXT_KEY, locked)
}

export async function onDialogOpen(string?: string): Promise<void> {
  log.debug('[DIALOG_OPEN] ' + string)
  await setSemaphoreState(true)
}

export async function onDialogClose(string?: string): Promise<void> {
  log.debug('[DIALOG_CLOSE] ' + JSON.stringify(string))
  await setSemaphoreState(false)
}

export const registerContext = async (): Promise<void> => {
  try {
    return await vscode.commands.executeCommand('setContext', SEMAPHORE_CONTEXT_KEY, false)
  } catch (error) {
    log.error('Failed to set semaphore state:', error)
  }
}
