import { log } from '../logging'
import { debounce } from '../utils'
import { clipboardManager } from '../extension'
import { ConfigStore } from '../config'
export class QuickCopyManager {
  count = 0
  lastTimestamp = Date.now()
  resetInterval = 500

  constructor() {
    this.resetCount = debounce(this.resetCount.bind(this), this.resetInterval)
  }

  async shouldResetClipboard(now: number): Promise<boolean> {
    await ConfigStore.instance.onConfigReady()

    const resetHotkeyEnabled = ConfigStore.instance.get<boolean>('enableClipboardResetCombo')
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

  resetCount() {
    this.count = 0
    log.debug('reset quick copy')
  }
}

export const quickCopyManager = new QuickCopyManager()
