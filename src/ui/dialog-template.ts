import * as vscode from 'vscode'
import { descriptionExamples as inquirtyDescriptionExamples, questionContextExamples as inquiryTypeExamples } from '../utils/consts'
import { DialogComponentManager } from './dialog-component-manager'

export const quickPickManager = new DialogComponentManager()
export const inputBoxManager = new DialogComponentManager()

/**
 * Prompts the user with a quick pick selection of predefined options along with an option to input a custom value.
 *
 * @param title - A descriptive title representing the nature of the options.
 * @param items - A list of predefined string options for the user to choose from.
 * @param customItemLabel - A label for the option that allows the user to input a custom value.
 * @returns A promise that resolves to an array containing the selected option or a custom input value. Returns an empty array if no option is selected.
 */
async function getInquirytOptions(title: string, items: string[], customItemLabel: string): Promise<string[]> {
  const customItem = `${customItemLabel} (Input Custom)`

  const selectedOption = await quickPickManager.show(() => {
    const quickPick = vscode.window.createQuickPick()
    quickPick.items = [{ label: customItem, description: `Input custom ${title}` }, ...items.map(item => ({ label: item, description: `Select ${title}` }))]
    quickPick.placeholder = `Select or Input ${title}`
    return quickPick
  })

  if (selectedOption) {
    if (selectedOption === customItem) {
      const customInput = await inputBoxManager.show(() => {
        const inputBox = vscode.window.createInputBox()
        inputBox.placeholder = '...'
        return inputBox
      })
      return customInput ? [customInput] : []
    } else {
      return [selectedOption]
    }
  }
  return []
}

export async function getInquirtyDescription(): Promise<string[]> {
  const inquiryTypeEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('inquiryType')
  const inquiryDescriptionEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('inquiryDescription')

  return inquiryTypeEnabled && inquiryDescriptionEnabled ? getInquirytOptions('Additional Information', inquirtyDescriptionExamples, 'Custom') : []
}

export async function getInquiryType(): Promise<string[]> {
  const inquiryTypeEnabled = vscode.workspace.getConfiguration('ChatCopyCat').get<boolean>('inquiryType')

  return inquiryTypeEnabled ? getInquirytOptions('Question Context', inquiryTypeExamples, 'Custom') : []
}
