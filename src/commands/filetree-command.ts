import { replaceFileListInClipboard } from '../clipboard'
import { generateFilesTemplate } from '../inquiry'
import { ConfigStore } from '../config'
import { getFlatFileList } from '../utils'

export const getFileTree = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const fileUris = await getFlatFileList()
  const template = generateFilesTemplate(fileUris)
  await replaceFileListInClipboard(template)
}
