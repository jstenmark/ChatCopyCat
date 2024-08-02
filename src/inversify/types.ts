import 'reflect-metadata' // Import reflect-metadata at the top

export const TYPES = {
  ClipboardManager: Symbol.for('ClipboardManager'),
  StatusBarManager: Symbol.for('StatusBarManager'),
  ClipboardHeadersChecker: Symbol.for('ClipboardHeadersChecker'),
  ClipboardUtils: Symbol.for('ClipboardUtils'),
  QuickCopyManager: Symbol.for('QuickCopyManager'),
  GetSymbolReferencesCommand: Symbol.for('GetSymbolReferencesCommand'),
}
