import ignore from 'ignore'
import { generateFilesTemplate } from '../inquiry/files-template'
import { getFileList, getProjectRootPaths } from '../utils/file-utils'
import { IProjectFile } from '../utils/types'
import { copyToClipboard, log, showNotification } from '../utils/vsc-utils'

// TODO: Check "Explorer contexts" if a folder is selected to copy relative filetree for a keybinding
export const getProjectsFileTree = async (): Promise<void> => {
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const projectsFiles: IProjectFile[] = []
  const igInstance = ignore()

  for (const rootPath of rootPaths) {
    const files: string[] = await getFileList(rootPath, rootPath, igInstance)
    projectsFiles.push({ rootPath, files })
  }

  const template: string = generateFilesTemplate(projectsFiles)
  log(template)
  const success: boolean = await copyToClipboard(template)
  if (!success) {
    await showNotification('error', 'ChatCopyCat: Failed to copy text to clipboard.')
  }
}
