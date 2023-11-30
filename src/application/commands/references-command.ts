import * as vscode from 'vscode'
import {Notify} from '../../infra/vscode/notification'
import {clipboardManager} from '../../infra/clipboard/clipboard-manager'
import {generateReferenceSections} from '../../adapters/ui/editor-utils'
import {acitveEditorOrFocurLast} from '../../infra/vscode/editor'
import {processSymbolsWithComments} from './process-symbols-comments'
import {statusBarManager} from '../../infra/vscode/statusbar-manager'


export const getSymbolReferences = async (): Promise<void> => {
  const editor: vscode.TextEditor | undefined = await acitveEditorOrFocurLast() // to adapters
  if(!editor) {
    return
  }
  const references = await processSymbolsWithComments(editor)

  const referenceSections = generateReferenceSections(references)
  await clipboardManager.copyToClipboard(referenceSections.join('\n').trim())
  Notify.info(`Copied ${referenceSections.length} references to clipboard`)
  statusBarManager.updateCopyCount(referenceSections.length)
}




