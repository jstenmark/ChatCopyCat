import { clipboardManager } from '../extension'
import { log } from '../logging'
import { debounce } from '../utils'

export class QuickCopyManager {
  count = 0
  lastTimestamp = Date.now()
  resetInterval = 500

  constructor() {
    this.resetCount = debounce(this.resetCount.bind(this), this.resetInterval)
  }

  async shouldResetClipboard(now: number): Promise<boolean> {
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
