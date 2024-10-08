
import {type IContentConfig} from '../../../domain/models/inquiry-template'
import {SemaphoreService} from '../../../domain/services/semaphore-service'
import {configStore} from '../../../infra/config/config-store'
import {createQuickPick} from '../components/window-components'
import {createInputBox} from '../components/window-components'
import {inputBoxManager,quickPickManager} from './dialog-components-manager'


export async function getInquiryType(config: IContentConfig): Promise<string[] | undefined> {
  await configStore.onConfigReady()
  await SemaphoreService.setDialogState(true)
  const defaultInquiryMessage = configStore.get<string>('defaultInquiryMessage')

  if (config.enableInquiryMessage && defaultInquiryMessage && defaultInquiryMessage !== '') {
    await SemaphoreService.setDialogState(false)
    return [defaultInquiryMessage]
  }

  const res = config.enableInquiryMessage
    ? await getInquiryOptions('Question Context', configStore.get<string[]>('inquiryMessagesList'), 'Custom')
    : undefined

  await SemaphoreService.setDialogState(false)
  return res
}
/*
 * Prompts the user with a quick pick selection of predefined options along with an option to input a custom value.
 *
 * @param title - A descriptive title representing the nature of the options.
 * @param items - A list of predefined string options for the user to choose from.
 * @param customItemLabel - A label for the option that allows the user to input a custom value.
 * @returns A promise that resolves to an array containing the selected option or a custom input value. Returns an empty array if no option is selected.
 */

export async function getInquiryOptions(
  title: string,
  items: string[],
  customItemLabel: string
): Promise<string[]> {
  const customItem = `${customItemLabel} (Input Custom)`

  const selectedOption = await quickPickManager.show(() => {
    const _items = [
      {label: customItem, description: `Input custom ${title}`},
      ...items.map(item => ({label: item, description: `Select ${title}`})),
    ]
    return createQuickPick(_items, [], title, `Select or Input ${title}`)
  })

  if (selectedOption) {
    if (selectedOption === customItem) {
      const customInput: string | undefined = await inputBoxManager.show(() => createInputBox({placeHolder: '...'}))
      return customInput ? [customInput] : []
    } else {
      return [selectedOption]
    }
  }
  return []
}
