import { log } from '../logging'
import { debounce } from '../utils'
import { clipboardManager } from '../extension'
import { configStore } from '../config'
export class QuickCopyManager {
  count = 0
  lastTimestamp = Date.now()
  resetInterval = 500

  constructor() {
    this.resetCount = debounce(this.resetCount.bind(this), this.resetInterval)
  }

  async shouldResetClipboard(now: number): Promise<boolean> {
    await configStore.whenConfigReady()

    const resetHotkeyEnabled = configStore.get<boolean>('enableClipboardResetCombo')
    if (!resetHotkeyEnabled) {
      log.info('Reset clipboard hotkey is disabled.')
      false
    }

    if (now - this.lastTimestamp < this.resetInterval) {
      this.count++
      if (this.count >= 2) {
        this.resetCount()
        await clipboardManager.resetClipboard()
        return true
      }
    } else {
      this.count = 1
    }
    this.lastTimestamp = now
    return false
  }

  resetCount() {
    this.count = 0
    log.debug('reset quick copy')
  }
}

export const quickCopyManager = new QuickCopyManager()
