import * as vscode from 'vscode'
import { DialogComponentManager } from './dialog-component-manager'
import { descriptionExamples, questionTypeExamples } from '../utils/consts'

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
async function generateInputOrSelectOptions(title: string, items: string[], customItemLabel: string): Promise<string[]> {
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
        inputBox.placeholder = 'Type something...'
        return inputBox
      })
      return customInput ? [customInput] : []
    } else {
      return [selectedOption]
    }
  }
  return []
}

export async function generateAdditionalInformationExamples(): Promise<string[]> {
  return generateInputOrSelectOptions('Additional Information', descriptionExamples, 'Custom')
}

export async function generateQuestionTypes(): Promise<string[]> {
  return generateInputOrSelectOptions('Question Type', questionTypeExamples, 'Custom')
}