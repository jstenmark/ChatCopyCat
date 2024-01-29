import {configStore} from '@infra/config'
import {languageExtensionMap} from '@shared/constants/consts'
import {SingletonMixin} from '@shared/utils/singleton'
import {IConfigPort} from '@domain/ports/config-port'
import {ILanguagePort} from '@domain/ports/language-port'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LanguageService {
  private static languagePort: ILanguagePort | undefined = undefined
  private static configPort: IConfigPort | undefined = undefined


  // eslint-disable-next-line @typescript-eslint/require-await
  static async initialize(
    languagePort: ILanguagePort,
    configPort: IConfigPort
  ): Promise<void> {
    if (!this.languagePort || !this.configPort) {
      this.languagePort = languagePort
      this.configPort = configPort
    } else {
      throw new Error('LanguageService has already been initialized')
    }
  }

  static async getCustomSupportedFileExtensions(): Promise<Set<string>> {
    //await this.configPort.onConfigReady()
    await configStore.onConfigReady()

    const extensionsSet = new Set<string>()
    const langs = await LanguageService.languagePort?.getLanguages() ?? []

    for (const lang of langs) {
      const extensions = languageExtensionMap[lang]
      if (extensions) {
        extensions.forEach(ext => extensionsSet.add(ext))
      }
    }
    //this.configPort.get<string[]>('definitionsAllowList').forEach(ext => extensionsSet.add(ext))
    configStore.get<string[]>('definitionsAllowList').forEach(ext => extensionsSet.add(ext))
    return extensionsSet
  }

}

export const LanguageServiceSingleton = SingletonMixin(LanguageService)
