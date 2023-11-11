import * as path from 'path'
import { Uri } from 'vscode'

export const defaultTabSize = 2

export const functionRegex = /function\s+[a-zA-Z_]\w*\s*\(|\([\w\s,]*\)\s*=>/g
export const classRegex = /class\s+[a-zA-Z_]\w*\s*\{/

export const generateHeader = (inquiryType?: string, language?: string) =>
  inquiryType
    ? `${selectionHeader}: ${inquiryType} - ${language}]`
    : `${selectionHeader} - ${language}]`

export const selectionHeader = '[Code Inquiry'
export const fileTreeHeader = '[File Tree] // Root path:'
export const fileTreeEnd = '[File Tree End]'

const iconPath = (icon: string): string => path.join(__dirname, '../../images/svg', icon)

export const iconLight: Uri = Uri.file(iconPath('chatcopycat_bubble_light.svg'))
export const iconDark: Uri = Uri.file(iconPath('chatcopycat_bubble_dark.svg'))
export const iconLightChill: Uri = Uri.file(iconPath('chatcopycat_chill_light.svg'))
export const iconDarkChill: Uri = Uri.file(iconPath('chatcopycat_chill_dark.svg'))
