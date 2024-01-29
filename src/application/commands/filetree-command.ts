import {generateFilesTemplate, getContentConfig} from '@domain/models/inquiry-template'
import {replaceFileListInClipboard} from '@infra/clipboard'
import {ConfigStoreSingleton} from '@infra/config/config-store'
import {getFlatFileList} from '@infra/file-tree/tree-transform'

export const getFileTree = async (): Promise<void> => {
  await ConfigStoreSingleton.instance.onConfigReady()
  const config = getContentConfig()
  const fileUris = await getFlatFileList()
  const template = generateFilesTemplate(fileUris,config)
  await replaceFileListInClipboard(template)
}
