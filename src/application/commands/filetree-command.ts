import {generateFilesTemplate, getContentConfig} from '../../domain/models/inquiry-template'
import {replaceFileListInClipboard} from '../../infra/clipboard'
import {ConfigStore} from '../../infra/config'
import {getFlatFileList} from '../../infra/file-tree/tree-transform'

export const getFileTree = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const config = getContentConfig()
  const fileUris = await getFlatFileList()
  const template = generateFilesTemplate(fileUris,config)
  await replaceFileListInClipboard(template)
}
