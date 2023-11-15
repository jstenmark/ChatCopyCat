import ignore from 'ignore'
import { replaceFileListInClipboard } from '../clipboard'
import { generateFilesTemplate } from '../inquiry'
import { getFileList, getProjectRootPaths } from '../utils'
import { ConfigStore, configStore } from '../config'

export const getFileTree = async (): Promise<void> => {
  await ConfigStore.instance.onConfigReady()
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const igInstance = ignore()
  const igList = configStore.get<string[]>('projectTreeIgnoreList')
  const projectsFilesPromises = rootPaths.map(async rootPath => {
    const files = await getFileList(rootPath, rootPath, igInstance, igList)
    return { rootPath, files }
  })

  const projectsFiles = await Promise.all(projectsFilesPromises)
  const template = generateFilesTemplate(projectsFiles)

  await replaceFileListInClipboard(template)
}
