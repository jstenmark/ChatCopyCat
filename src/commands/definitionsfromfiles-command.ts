import { Uri, window, env, DocumentSymbol, commands, workspace, languages } from 'vscode'
import { log } from '../logging'
import { configStore } from '../config'
import { languageExtensionMap } from '../common'
import { getUriFromFileTree, showFolderTreeQuickPick } from '../utils'
import { IFileListItem } from '../utils/file-utils'
import * as path from 'path'

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

export interface IPathUriItem {
  path: string
  uri: Uri
}
//const fileUris = fileTreePicked.map(file => Uri.file(path.join(file.rootPath, file.path)))
async function gatherDefinitions(): Promise<string[]> {
  const allowExtList = await getCustomSupportedFileExtensions()
  const customIgnoreList = configStore.get<string[]>('definitionsIgnoreList')
  //const showLangInPerSnippet = configStore.get<boolean>('showLanguageInSnippets')
  const fileTree = await getUriFromFileTree(customIgnoreList, allowExtList)
  const fileTreePicked: IFileListItem[] = await showFolderTreeQuickPick(fileTree)
  log.debug('picked', fileTreePicked, { truncate: 0 })

  const fileUris: IPathUriItem[] = fileTreePicked.map(item => ({
    uri: Uri.file(path.join(item.rootPath, item.path)),
    path: item.path,
  }))

  const allDefinitions: string[] = []
  for (const { uri, path } of fileUris) {
    const doc = await workspace.openTextDocument(uri)
    const symbols = await commands.executeCommand<DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      uri,
    )
    if (symbols) {
      const definitions = symbols.map(symbol => doc.getText(symbol.range))
      allDefinitions.push(codeBlock(definitions, path, doc.languageId))
    }
  }
  return allDefinitions
}

const codeBlock = (code: string[], path: string, lang = '') =>
  `\n\`\`\`${lang} ${path}\n${code.join('\n')}\n\`\`\``

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
