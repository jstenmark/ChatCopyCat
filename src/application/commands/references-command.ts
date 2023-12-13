import * as vscode from 'vscode'
import {Notify} from '../../infra/vscode/notification'
import {clipboardManager} from '../../infra/clipboard/clipboard-manager'
import {generateReferenceSections} from '../../adapters/ui/editor-utils'
import {activeEditorOrFocusLast} from '../../infra/vscode/editor'
import {processSymbolsWithComments} from './process-symbols-comments'
import {statusBarManager} from '../../infra/vscode/statusbar-manager'
import {getContentConfig} from '../../domain/models/inquiry-template'
import {showAppendOrCopyDialog} from '../../adapters/ui/dialog/append-copy-dialog'


export const getSymbolReferences = async (): Promise<void> => {
  const editor: vscode.TextEditor | undefined = await activeEditorOrFocusLast() // to adapters
  if(!editor) {
    return
  }
  const config = getContentConfig()

  const references = await processSymbolsWithComments(editor, config)
  const referenceSections = generateReferenceSections(references, config)

  const action = await showAppendOrCopyDialog()
  if (!action) {
    return
  }

  const referenceText = referenceSections.join('\n').trim()
  if (action === 'append') {
    await clipboardManager.appendToClipboard(
      referenceText,
      await clipboardManager.readFromClipboard(),
      referenceSections.length
    )
    Notify.info(`Appended ${referenceSections.length} references to clipboard`)
  } else if (action === 'copy') {
    await clipboardManager.copyToClipboard(referenceText)
    Notify.info(`Copied ${referenceSections.length} references to clipboard`)
    statusBarManager.updateCopyCount(referenceSections.length)

  }
}




