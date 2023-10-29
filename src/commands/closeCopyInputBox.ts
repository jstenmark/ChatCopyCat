import { inputBoxManager, quickPickManager } from '../inquiry/dialogTemplate'
import { log } from '../utils/vsc-utils'

/**
 * Closes the currently active UI component used for copying input.
 *
 * This function determines which of the two UI components (QuickPick or InputBox)
 * is currently active and closes it. It ensures that unnecessary function calls
 * are avoided by only attempting to close the component if it is active.
 */
export const closeCopyInputBox = (): void => {
  log('Closing input')

  if (quickPickManager.isActive()) {
    quickPickManager.close()
  } else if (inputBoxManager.isActive()) {
    inputBoxManager.close()
  }
}
