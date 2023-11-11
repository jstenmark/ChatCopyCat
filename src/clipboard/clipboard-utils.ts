import { ILangOpts, fileTreeEnd, fileTreeHeader, selectionHeader } from '../common'
import { clipboardManager } from '../extension'
import { getMetadataSection } from '../inquiry'

interface IHeadersPresent {
  selectionHeaderPresent: boolean
  fileTreeHeaderPresent: boolean
  fileTreeEndPresent: boolean
  clipboardContent: string
}

interface IHeaderIndex {
  selectionHeaderIndex: number
  selectionHeaderEnd: number
  fileTreeHeaderIndex: number
  fileTreeEndIndex: number
  clipboardContent: string
}

export async function headersInClipboard(content?: string): Promise<IHeadersPresent> {
  if (!content || content.length !== 0) {
    content = await clipboardManager.readFromClipboard()
  }

  return {
    selectionHeaderPresent: content.includes(selectionHeader),
    fileTreeHeaderPresent: content.includes(fileTreeHeader),
    fileTreeEndPresent: content.includes(fileTreeEnd),
    clipboardContent: content,
  }
}

export async function headerIndexInClipboard(content?: string): Promise<IHeaderIndex> {
  if (!content || content.length !== 0) {
    content = await clipboardManager.readFromClipboard()
  }
  const selectionHeaderIndex = content.indexOf(selectionHeader)
  const selectionHeaderEnd = content.indexOf(']', selectionHeaderIndex + selectionHeader.length)

  return {
    selectionHeaderIndex,
    selectionHeaderEnd,
    fileTreeHeaderIndex: content.indexOf(fileTreeHeader),
    fileTreeEndIndex: content.indexOf(fileTreeEnd),
    clipboardContent: content,
  }
}

export async function replaceFileListInClipboard(newFileListTemplate: string): Promise<void> {
  const { selectionHeaderPresent, fileTreeHeaderPresent, fileTreeEndPresent, clipboardContent } =
    await headersInClipboard()
  const { fileTreeHeaderIndex, fileTreeEndIndex } = await headerIndexInClipboard(clipboardContent)

  let fileTreeEndIndexFinal = fileTreeEndIndex

  if (fileTreeHeaderPresent && fileTreeEndPresent) {
    fileTreeEndIndexFinal += fileTreeEnd.length
    if (clipboardContent[fileTreeEndIndexFinal] === '\n') {
      fileTreeEndIndexFinal++
    }

    const updatedContent =
      clipboardContent.substring(0, fileTreeHeaderIndex) +
      newFileListTemplate.trim() +
      '\n' +
      clipboardContent.substring(fileTreeEndIndexFinal)

    await clipboardManager.copyToClipboard(updatedContent)
  } else {
    if (selectionHeaderPresent) {
      // Prepend fileTree before seclection content, copyCount+1
      await clipboardManager.prependToClipboard(
        newFileListTemplate.trim() + '\n',
        clipboardContent,
        true,
      )
    } else {
      // Add fileTree , copyCount=1
      await clipboardManager.copyToClipboard(newFileListTemplate, true)
    }
  }
}

export async function updateClipboardWithCopy(
  inquiryType: string[] | undefined,
  selectionSections: string[],
  langOpts: ILangOpts,
): Promise<void> {
  const { selectionHeaderPresent, fileTreeHeaderPresent, fileTreeEndPresent, clipboardContent } =
    await headersInClipboard()

  const fileMetadataSection = getMetadataSection(
    inquiryType,
    selectionHeaderPresent,
    langOpts,
    selectionSections.length > 1 ? true : false,
  ).trim()
  const selectionContent = selectionSections.join('\n').trim()

  const clipboardUpdateContent = `\n${fileMetadataSection}\n${selectionContent}`

  if ((fileTreeHeaderPresent && fileTreeEndPresent) || selectionHeaderPresent) {
    await clipboardManager.appendToClipboard(
      clipboardUpdateContent,
      clipboardContent,
      selectionHeaderPresent,
    )
  } else {
    await clipboardManager.copyToClipboard(clipboardUpdateContent, true)
  }
}
