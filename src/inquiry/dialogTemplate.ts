import * as vscode from 'vscode'
import { DialogComponentManager } from '../ui/DialogComponentManager'

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
  const examples = [
    'This is part of a larger project.',
    'Im getting a "TypeError" when running the code.',
    'This code is part of a larger project related to e-commerce.',
    'Im following a tutorial on YouTube, and Im stuck at this step.',
    'Im working on a personal project for data analysis.',
    'This code is intended to be used in a web application.',
    'Ive already tried changing the variable names, but it didnt work.',
    'Im using the latest version of Node.js.',
    'Im new to programming and trying to learn JavaScript.',
    'This code was working fine until I made some changes yesterday.',
  ]

  return generateInputOrSelectOptions('Additional Information', examples, 'Custom')
}

export async function generateQuestionTypes(): Promise<string[]> {
  const types = ['Optimization', 'Syntax', 'Logic', 'Debugging', 'Error Handling', 'Code Structure', 'Performance', 'Testing', 'Security', 'Documentation']

  return generateInputOrSelectOptions('Question Type', types, 'Custom')
}

export function generateCodeRelatedQuestions(): string[] {
  return [
    'How can I optimize this algorithm for better performance?',
    'Im struggling with a type error in my TypeScript code. Can someone help?',
    'I need assistance with implementing authentication in my web app.',
    'How do I use async/await in Python for asynchronous operations?',
    'Im looking for a solution to handle file uploads in Node.js.',
    'Whatss the best practice for handling exceptions in Express applications?',
    'Im trying to integrate a third-party API into my project. Any tips?',
    'How can I improve the security of my PHP application?',
    'Im getting a CORS error in my React app. How can I fix it?',
    'Can someone review my SQL query and suggest improvements?',
  ]
}
