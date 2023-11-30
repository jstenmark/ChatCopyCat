import {getMetadataSection} from '../../domain/models/inquiry-template'
import {selectionHeader, fileTreeHeader, fileTreeEnd} from '../../shared/constants/consts'
import {IHeadersPresent, IHeaderIndex, ILangOpts} from '../../shared/types/types'
import {statusBarManager} from '../vscode/statusbar-manager'
import {clipboardManager} from './clipboard-manager'

/**
 * Checks if specific headers are present in the clipboard content.
 * @param content Optional clipboard content. If not provided, the current clipboard content is read.
 * @returns An object indicating the presence of various headers in the clipboard content.
 */
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

/**
 * Finds the index positions of specific headers in the clipboard content.
 * @param content Optional clipboard content. If not provided, the current clipboard content is read.
 * @returns An object with index positions of various headers in the clipboard content.
 */
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

/**
 * Replaces the file list in the clipboard content with a new file list template.
 * @param newFileListTemplate The new file list template to replace in the clipboard content.
 */
export async function replaceFileListInClipboard(newFileListTemplate: string): Promise<void> {
  const {selectionHeaderPresent, fileTreeHeaderPresent, fileTreeEndPresent, clipboardContent} =
    await headersInClipboard()
  const {fileTreeHeaderIndex, fileTreeEndIndex} = await headerIndexInClipboard(clipboardContent)

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
      await clipboardManager.copyToClipboard(newFileListTemplate, true)
    }
  }
}

/**
 * Updates the clipboard content with new copy information based on inquiry type and language options.
 * @param inquiryType The type of inquiry to update in the clipboard content.
 * @param selectionSections The sections of the selection to include in the update.
 * @param langOpts Language options for formatting the update.
 */
export async function updateClipboardWithCopy(
  inquiryType: string[] | undefined,
  selectionSections: string[],
  referenceSections: string[] | undefined,
  langOpts: ILangOpts,
): Promise<void> {
  const {selectionHeaderPresent, fileTreeHeaderPresent, fileTreeEndPresent, clipboardContent} =
    await headersInClipboard()

  const fileMetadataSection = getMetadataSection(
    inquiryType,
    selectionHeaderPresent,
    langOpts,
    selectionSections.length > 1 ? true : false,
  ).trim()
  const selectionContent = selectionSections.join('\n').trim()
  const referenceContent = referenceSections ? referenceSections.join('\n').trim()+'\n' : ''

  const clipboardUpdateContent = `\n${fileMetadataSection}\n${selectionContent}\n${referenceContent}`


  if ((fileTreeHeaderPresent && fileTreeEndPresent) || selectionHeaderPresent) {
    await clipboardManager.appendToClipboard(
      clipboardUpdateContent,
      clipboardContent,
      selectionHeaderPresent,
    )
    statusBarManager.increaseCopyCount(referenceSections?.length)

  } else {
    await clipboardManager.copyToClipboard(clipboardUpdateContent, true)
    statusBarManager.increaseCopyCount(selectionSections.length + referenceSections!.length || 0)

  }
}

//interface IUpdateTooltip {
//  filetree: boolean
//  references: boolean
//  definitions: boolean
//  multiCopy: boolean
//  copy: boolean
//}