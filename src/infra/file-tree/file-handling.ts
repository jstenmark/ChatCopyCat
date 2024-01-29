import * as fs from 'fs'
import {Ignore} from 'ignore'
import * as path from 'path'
import {IFileListItem} from '@domain/models/filetree-types'
import {isDirectoryOrFile} from '@infra/system/file-utils'

export async function getFileList(
  directory: string,
  originalRoot: string,
  ig: Ignore,
  allowExtList?: Set<string>,
): Promise<IFileListItem[]> {
  const files = await fs.promises.readdir(directory)
  const fileList: IFileListItem[] = []

  for (const file of files) {
    const fullPath = path.join(directory, file)
    const fullRelativePath = path.relative(originalRoot, fullPath)

    if (ig.ignores(fullRelativePath)) {
      continue
    }

    await isDirectoryOrFile<void>(
      fullPath,
      () => handleDirectory(fileList, fullPath, fullRelativePath, originalRoot, ig, allowExtList),
      () => handleFile(fileList, fullPath, fullRelativePath, originalRoot, ig, allowExtList),
    )
  }
  return fileList
}

async function handleDirectory(
  fileList: IFileListItem[],
  fullPath: string,
  relativePath: string,
  originalRoot: string,
  ig: Ignore,
  allowExtList?: Set<string>,
) {
  if (allowExtList) {
    fileList.push({path: relativePath, isFolder: true, rootPath: originalRoot})
  }
  if (!ig.ignores(relativePath + '/')) {
    fileList.push(...(await getFileList(fullPath, originalRoot, ig, allowExtList)))
  }
}

async function handleFile(
  fileList: IFileListItem[],
  fullPath: string,
  relativePath: string,
  originalRoot: string,
  ig: Ignore,
  allowExtList?: Set<string>,
) {
  const fileExt = path.extname(fullPath)
  if (fullPath.endsWith('.gitignore')) {
    await processGitignore(fullPath, ig)
  } else if (!allowExtList || allowExtList.has(fileExt)) {
    fileList.push({path: relativePath, isFolder: false, rootPath: originalRoot})
  }
}

async function processGitignore(filePath: string, ig: Ignore) {
  const gitignoreContent = await fs.promises.readFile(filePath, 'utf8')
  const gitignoreDir = path.dirname(filePath)
  const patterns = parseGitignore(gitignoreContent, gitignoreDir)
  ig.add(patterns)
}

/**
 * Parse a .gitignore content and return an array of patterns.
 * @param gitignoreContent - The content of the .gitignore file.
 * @param basePath - The directory path of the .gitignore file.
 * @returns An array of patterns to be ignored.
 */
export function parseGitignore(gitignoreContent: string, basePath: string): string[] {
  return gitignoreContent
    .split(/\n|\r/)
    .filter(line => !line.startsWith('#') && line.trim() !== '')
    .map(line => path.join(basePath, line))
}
