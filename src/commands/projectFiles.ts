import ignore from 'ignore'
import { getFileList, getProjectRootPaths } from '../utils/file-utils'
import { copyToClipboard, log, showErrorMessage } from '../utils/vsc-utils'
import { generateFilesTemplate } from '../inquiry/filesTemplate'

interface IProjectFile {
  rootPath: string
  files: string[]
}

export const getProjectsFileTree = async (): Promise<void> => {
  const rootPaths: string[] = getProjectRootPaths() || []
  const projectsFiles: IProjectFile[] = []
  const igInstance = ignore()

  for (const rootPath of rootPaths) {
    const files: string[] = await getFileList(rootPath, rootPath, igInstance)
    projectsFiles.push({ rootPath, files })
  }

  const template: string = generateFilesTemplate(projectsFiles)
  log(template)
  const success: boolean = copyToClipboard(template)
  if (!success) {
    showErrorMessage('ChatCopyCat: Failed to copy text to clipboard.')
  }
}
