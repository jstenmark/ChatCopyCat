import ignore from 'ignore'
import { clipboardManager } from '../extension'
import { generateFilesTemplate } from '../inquiry/inquiry-template'
import { getFileList, getProjectRootPaths } from '../utils/file-utils'

export const getFileTree = async (): Promise<void> => {
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const igInstance = ignore()

  const projectsFilesPromises = rootPaths.map(async rootPath => {
    const files = await getFileList(rootPath, rootPath, igInstance)
    return { rootPath, files }
  })

  const projectsFiles = await Promise.all(projectsFilesPromises)
  const template = generateFilesTemplate(projectsFiles)

  await clipboardManager.copyToClipboard(template)
}
