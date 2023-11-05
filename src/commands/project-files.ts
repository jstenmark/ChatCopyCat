import ignore from 'ignore'
import { ClipboardManager } from '../extension'
import { generateFilesTemplate } from '../inquiry/files-template'
import { getFileList, getProjectRootPaths } from '../utils/file-utils'
import { IProjectFile } from '../utils/types'

export const getProjectsFileTree = async (): Promise<void> => {
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const projectsFiles: IProjectFile[] = []
  const igInstance = ignore()

  for (const rootPath of rootPaths) {
    const files: string[] = await getFileList(rootPath, rootPath, igInstance)
    projectsFiles.push({ rootPath, files })
  }

  const template: string = generateFilesTemplate(projectsFiles)

  await ClipboardManager.copyToClipboard(template)
}
