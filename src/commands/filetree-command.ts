//import { replaceFileListInClipboard } from '../clipboard'
//import { generateFilesTemplate } from '../inquiry'
import { ConfigStore } from '../config'
//import { getUriFromFileTree } from '../utils'

export const getFileTree = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  //  const fileUris = await getUriFromFileTree()
  // const template = generateFilesTemplate(fileUris)

  //await replaceFileListInClipboard(template)
}
