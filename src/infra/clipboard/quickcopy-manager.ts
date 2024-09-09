import {inject, injectable} from 'inversify'

import {ClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {TYPES} from '../../inversify/types'
import {debounce} from '../../shared/utils/debounce'
import {ConfigStore} from '../config'
import {log} from '../logging/log-base'
import {LogDecorator} from '../logging/log-decorator'
import {LogLevel} from '../logging/types'

@injectable()
export class QuickCopyManager {
  private count = 0
  private lastTimestamp = Date.now()
  private resetInterval = 500

  constructor(
    @inject(TYPES.ClipboardManager) private clipboardManager: ClipboardManager,
  ) {
    log.debug('Initializing QuickCopyManager')
    this.resetCount = debounce(this.resetCount.bind(this), this.resetInterval)
  }

  /**
   * Determines whether the clipboard should be reset based on the current timestamp and user interactions.
   * @param now The current timestamp.
   * @returns A boolean indicating whether the clipboard should be reset.
   */
  async shouldResetClipboard(now: number): Promise<boolean> {
    await ConfigStore.instance.onConfigReady()

    const resetHotkeyEnabled = ConfigStore.instance.get<boolean>('enableClipboardResetCombo')
    if (!resetHotkeyEnabled) {
      log.info('Reset clipboard hotkey is disabled.')
      return false
    }

    const _now = typeof now !== 'undefined' ? now : Date.now()

    if (_now - this.lastTimestamp < this.resetInterval) {
      this.count++
      if (this.count >= 2) {
        this.resetCount()
        await this.clipboardManager.resetClipboard()
        return true
      }
    } else {
      this.count = 1
    }
    this.lastTimestamp = _now
    return false
  }

  /**
   * Resets the internal count for quick copy operations.
   */
  @LogDecorator(LogLevel.DEBUG, 'Reset quick copy count')
  private resetCount() {
    this.count = 0
  }
}
