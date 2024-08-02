import {generateFilesTemplate, getContentConfig} from '../../domain/models/inquiry-template'
import {ClipboardUtils} from '../../infra/clipboard/clipboard-utils'
import {ConfigStore} from '../../infra/config'
import {getFlatFileList} from '../../infra/file-tree/tree-transform'
import {container} from '../../inversify/inversify.config'
import {TYPES} from '../../inversify/types'

export const getFileTree = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const clipboardUtils = container.get<ClipboardUtils>(TYPES.ClipboardUtils)
  const config = getContentConfig()
  const fileUris = await getFlatFileList()
  const template = generateFilesTemplate(fileUris, config)
  await clipboardUtils.replaceFileListInClipboard(template)
}
