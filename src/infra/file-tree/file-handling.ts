import * as fs from 'fs'
import * as path from 'path'
import {IFileListItem} from '../../domain/models/filetree-types'
import {isDirectoryOrFile} from '../system/file-utils'
import {isIgnored, parseGitignorePatterns} from '../../shared/utils/ignore'

export async function getFileList(
  directory: string,
  originalRoot: string,
  ignorePatterns: {regex: RegExp; negated: boolean}[],
  allowExtList?: Set<string>,
): Promise<IFileListItem[]> {
  const files = await fs.promises.readdir(directory)
  const fileList: IFileListItem[] = []
  for (const file of files) {
    const fullPath = path.join(directory, file)
    const fullRelativePath = path.relative(originalRoot, fullPath)
    if (isIgnored(fullRelativePath, ignorePatterns)) {
      continue
    }
    await isDirectoryOrFile<void>(
      fullPath,
      () => handleDirectory(fileList, fullPath, fullRelativePath, originalRoot, ignorePatterns, allowExtList),
      () => handleFile(fileList, fullPath, fullRelativePath, originalRoot, ignorePatterns, allowExtList),
    )
  }
  return fileList
}

async function handleDirectory(
  fileList: IFileListItem[],
  fullPath: string,
  relativePath: string,
  originalRoot: string,
  ignorePatterns: {regex: RegExp; negated: boolean}[],
  allowExtList?: Set<string>,
) {
  if (allowExtList) {
    fileList.push({path: relativePath, isFolder: true, rootPath: originalRoot})
  }
  if (!isIgnored(relativePath + '/', ignorePatterns)) {
    fileList.push(...(await getFileList(fullPath, originalRoot, ignorePatterns, allowExtList)))
  }
}

async function handleFile(
  fileList: IFileListItem[],
  fullPath: string,
  relativePath: string,
  originalRoot: string,
  ignorePatterns: {regex: RegExp; negated: boolean}[],
  allowExtList?: Set<string>,
) {
  const fileExt = path.extname(fullPath)
  if (fullPath.endsWith('.gitignore')) {
    await processGitignore(fullPath, ignorePatterns)
  } else if (!allowExtList || allowExtList.has(fileExt)) {
    fileList.push({path: relativePath, isFolder: false, rootPath: originalRoot})
  }
}

async function processGitignore(filePath: string, ignorePatterns: {regex: RegExp; negated: boolean}[]) {
  const gitIgnoreContent = await fs.promises.readFile(filePath, 'utf8')
  const patterns = parseGitignorePatterns(gitIgnoreContent)
  ignorePatterns.push(...patterns)
}
