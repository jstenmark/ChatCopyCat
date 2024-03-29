import {log} from '@infra/logging/log-base'
import {clipboardManager} from '@infra/clipboard'
import {ConfigStoreSingleton} from '@infra/config/config-store'
import {debounce} from '@shared/utils/debounce'
import {LogDecorator} from '@infra/logging/log-decorator'
import {LogLevel} from '@infra/logging/log-utils'

/**
 * Manages quick copy operations, providing functionality to reset the clipboard content
 * based on user interactions and configuration settings.
 */
export class QuickCopyManager {
  count = 0
  lastTimestamp = Date.now()
  resetInterval = 500

  constructor() {
    this.resetCount = debounce(this.resetCount.bind(this), this.resetInterval)
  }

  /**
   * Determines whether the clipboard should be reset based on the current timestamp and user interactions.
   * @param now The current timestamp.
   * @returns A boolean indicating whether the clipboard should be reset.
   */
  async shouldResetClipboard(now: number): Promise<boolean> {
    await ConfigStoreSingleton.instance.onConfigReady()

    const resetHotkeyEnabled = ConfigStoreSingleton.instance.get<boolean>('enableClipboardResetCombo')
    if (!resetHotkeyEnabled) {
      log.info('Reset clipboard hotkey is disabled.')
      false
    }
    const _now = typeof now !== 'undefined' ? now : Date.now()

    if (_now - this.lastTimestamp < this.resetInterval) {
      this.count++
      if (this.count >= 2) {
        this.resetCount()
        await clipboardManager.resetClipboard()
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
  resetCount() {
    this.count = 0
  }
}

export const quickCopyManager = new QuickCopyManager()
