// src/application/commands/clipboard-utils.ts
import {inject, injectable} from 'inversify'

import {ClipboardHeadersChecker} from '../../application/commands/clipboard-headers'
import {getMetadataSection,IContentConfig} from '../../domain/models/inquiry-template'
import {TYPES} from '../../inversify/types'
import {fileTreeEnd,fileTreeHeader, selectionHeader} from '../../shared/constants/consts'
import {IHeaderIndex, IHeadersPresent, ILangOpts} from '../../shared/types/types'
import {log} from '../logging/log-base'
import {ClipboardManager} from './clipboard-manager'

@injectable()
export class ClipboardUtils {
  constructor(
    @inject(TYPES.ClipboardManager) private clipboardManager: ClipboardManager,
    @inject(TYPES.ClipboardHeadersChecker) private clipboardHeadersChecker: ClipboardHeadersChecker
  ) { }
  /**
   * Checks if specific headers are present in the clipboard content.
   * @param content Optional clipboard content. If not provided, the current clipboard content is read.
   * @returns An object indicating the presence of various headers in the clipboard content.
   */
  public async headersInClipboard(content?: string): Promise<IHeadersPresent> {
    if (!content || content.length === 0) {
      content = await this.clipboardManager.readFromClipboard()
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
  public async headerIndexInClipboard(content?: string): Promise<IHeaderIndex> {
    if (!content || content.length === 0) {
      content = await this.clipboardManager.readFromClipboard()
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
  public async replaceFileListInClipboard(newFileListTemplate: string): Promise<void> {
    const {selectionHeaderPresent, fileTreeHeaderPresent, fileTreeEndPresent, clipboardContent} =
      await this.headersInClipboard()
    const {fileTreeHeaderIndex, fileTreeEndIndex} = await this.headerIndexInClipboard(clipboardContent)

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

      await this.clipboardManager.copyToClipboard(updatedContent)
    } else {
      if (selectionHeaderPresent) {
        // Prepend fileTree before selection content, copyCount+1
        await this.clipboardManager.prependToClipboard(
          newFileListTemplate.trim() + '\n',
          clipboardContent,
          1,
        )
      } else {
        await this.clipboardManager.copyToClipboard(newFileListTemplate, 1)
      }
    }
  }

  /**
   * Updates the clipboard content with new copy information based on inquiry type and language options.
   * @param inquiryType The type of inquiry to update in the clipboard content.
   * @param selectionSections The sections of the selection to include in the update.
   * @param langOpts Language options for formatting the update.
   */
  public async updateClipboardWithCopy(
    inquiryType: string[] | undefined,
    selectionSections: string[],
    referenceSections: string[] | undefined,
    langOpts: ILangOpts,
    config: IContentConfig
  ): Promise<void> {
    const {selectionHeaderPresent, fileTreeHeaderPresent, fileTreeEndPresent, clipboardContent} =
      await this.headersInClipboard()

    const treePresent = fileTreeHeaderPresent && fileTreeEndPresent
    const anyHeaderPresent = (fileTreeHeaderPresent && fileTreeEndPresent) || selectionHeaderPresent
    // selectionHeaderPresent

    const fileMetadataSection = getMetadataSection(
      config.enableInquiryMessage ? inquiryType : undefined,
      selectionHeaderPresent,
      langOpts,
      selectionSections.length > 1 ? true : false,
      config
    ).trim()

    const selectionContent = selectionSections.join('\n').trim()
    const referenceContent = referenceSections ? referenceSections.join('\n').trim() + '\n' : ''
    const clipboardUpdateContent = `\n${fileMetadataSection}\n${selectionContent}\n${referenceContent}`

    const selectionCount = selectionSections.length
    const referenceCount = referenceSections?.length ? referenceSections.length : 0

    const contentCount = this.calculateContentCount(
      selectionCount,
      referenceCount,
      treePresent,
      selectionHeaderPresent
    )

    // TODO: fix statusbar counter
    log.debug('COUNT', {
      selectionCount,
      referenceCount,
      treePresent,
      selectionHeaderPresent,
      CONTENCOUNT: contentCount,
    }, {truncate: 0})

    if (anyHeaderPresent) {
      await this.clipboardManager.appendToClipboard(
        clipboardUpdateContent,
        clipboardContent,
        contentCount
      )
    } else {
      await this.clipboardManager.copyToClipboard(clipboardUpdateContent, contentCount)
    }
  }

  private calculateContentCount(
    selectionCount: number,
    referenceCount: number,
    treeHeaderPresent: boolean,
    sectionHeaderPresent: boolean
  ): number {
    // Custom logic to calculate content count based on headers
    const count = selectionCount + referenceCount

    if (treeHeaderPresent) {
      // count += 1 // Add logic for tree header
    }

    if (sectionHeaderPresent) {
      // count += 1 // Assuming you want to increment by 1 for section header
    }

    return count
  }
}
