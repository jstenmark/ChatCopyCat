import {inject, injectable} from 'inversify'

import {showAppendOrCopyDialog} from '../../adapters/ui/dialog/append-copy-dialog'
import {generateReferenceSections} from '../../adapters/ui/editor-utils'
import {getContentConfig} from '../../domain/models/inquiry-template'
import {ClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {activeEditorOrFocusLast} from '../../infra/vscode/editor'
import {Notify} from '../../infra/vscode/notification'
import {StatusBarManager} from '../../infra/vscode/statusbar-manager'
import {TYPES} from '../../inversify/types'
import {Command} from '../extension/command-decorator'
import {processSymbolsWithComments} from './process-symbols-comments'

@injectable()
export class GetSymbolReferencesCommand extends Command {
  constructor(
    @inject(TYPES.ClipboardManager) private clipboardManager: ClipboardManager,
    @inject(TYPES.StatusBarManager) private statusBarManager: StatusBarManager
  ) {
    super('chatcopycat.getSymbolReferences')
  }

  // @command('extension.getSymbolReferences')
  async execute(): Promise<void> {
    const editor = await activeEditorOrFocusLast()
    if (!editor) {
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
      await this.clipboardManager.appendToClipboard(
        referenceText,
        await this.clipboardManager.readFromClipboard(),
        referenceSections.length,
      )
      Notify.info(`Appended ${referenceSections.length} references to clipboard`)
    } else if (action === 'copy') {
      await this.clipboardManager.copyToClipboard(referenceText)
      Notify.info(`Copied ${referenceSections.length} references to clipboard`)
      this.statusBarManager.updateCopyCount(referenceSections.length)
    }
  }
}
