import {generateFilesTemplate} from '../../domain/models/inquiry-template'
import {replaceFileListInClipboard} from '../../infra/clipboard'
import {ConfigStore} from '../../infra/config'
import {getFlatFileList} from '../../infra/file-tree/tree-transform'

export const getFileTree = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const fileUris = await getFlatFileList()
  const template = generateFilesTemplate(fileUris)
  await replaceFileListInClipboard(template)
}
