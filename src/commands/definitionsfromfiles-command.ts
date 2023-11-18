import { Uri, window, env, DocumentSymbol, commands, workspace, languages } from 'vscode'
import { log } from '../logging'
import { configStore } from '../config'
import { languageExtensionMap } from '../common'
import { getUriFromFileTree, showFolderTreeQuickPick } from '../utils'
import { IFileListItem } from '../utils/file-utils'

export async function copyDefinitionsFromFiles(): Promise<void> {
  try {
    await configStore.onConfigReady()
    const allDefinitions = await gatherDefinitions()
    if (allDefinitions.length === 0) {
      await window.showInformationMessage('No definitions found in the files.')
      return
    }
    await env.clipboard.writeText(allDefinitions.join('\n\n'))
    await window.showInformationMessage(`Copied ${allDefinitions.length} definitions to clipboard.`)
  } catch (error) {
    log.error('Error copying definitions from files:', error)
    Promise.resolve(window.showErrorMessage('Error occurred while copying definitions.')).catch(
      e => !!e,
    )
  }
}

//const fileUris = fileTreePicked.map(file => Uri.file(path.join(file.rootPath, file.path)))
async function gatherDefinitions(): Promise<string[]> {
  const allowExtList = await getCustomSupportedFileExtensions()
  const customIgnoreList = configStore.get<string[]>('definitionsIgnoreList')

  const fileTree = await getUriFromFileTree(customIgnoreList, allowExtList)
  const fileTreePicked: IFileListItem[] = await showFolderTreeQuickPick(fileTree)
  const fileUris: Uri[] = fileTreePicked.map(item => Uri.file(item.path))

  const allDefinitions: string[] = []
  for (const uri of fileUris) {
    const doc = await workspace.openTextDocument(uri)
    const symbols = await commands.executeCommand<DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      uri,
    )
    if (symbols) {
      const definitions = symbols.map(symbol => doc.getText(symbol.range))
      allDefinitions.push(...definitions)
    }
  }
  return allDefinitions
}

async function getCustomSupportedFileExtensions(): Promise<Set<string>> {
  await configStore.onConfigReady()
  const extensionsSet = new Set<string>()
  const langs = await languages.getLanguages()
  for (const lang of langs) {
    const extensions = languageExtensionMap[lang]
    if (extensions) {
      extensions.forEach(ext => extensionsSet.add(ext))
    }
  }
  configStore.get<string[]>('definitionsAllowList').forEach(ext => extensionsSet.add(ext))
  //log.debug('SET=', Array.from(extensionsSet), { truncate: 0 })
  return extensionsSet
}
