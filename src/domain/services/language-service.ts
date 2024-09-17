import {configStore} from '../../infra/config/config-store'
import {languageExtensionMap} from '../../shared/constants/consts'
import {SingletonBase} from '../../shared/utils/singleton'
import {type IConfigPort} from '../ports/config-port'
import {type ILanguagePort} from '../ports/language-port'

export class LanguageService extends SingletonBase {
  private static languagePort: ILanguagePort | undefined = undefined
  private static configPort: IConfigPort | undefined = undefined


  private constructor() {
    super()
  }


  static async initialize(
    languagePort: ILanguagePort,
    configPort: IConfigPort
  ): Promise<void> {
    if (!this.languagePort || !this.configPort) {
      this.languagePort = languagePort
      this.configPort = configPort
      this.instance
    } else {
      throw new Error('LanguageService has already been initialized')
    }
  }

  static get instance(): LanguageService {
    if (!this.languagePort || !this.configPort) {
      throw new Error('LanguageService is not initialized')
    }
    return super.getInstance<LanguageService>(this)
  }


  static async getCustomSupportedFileExtensions(): Promise<Set<string>> {
    // await this.configPort.onConfigReady()
    await configStore.onConfigReady()

    const extensionsSet = new Set<string>()
    const langs = await this.languagePort!.getLanguages()

    for (const lang of langs) {
      const extensions = languageExtensionMap[lang]
      if (extensions) {
        extensions.forEach(ext => extensionsSet.add(ext))
      }
    }
    configStore.get<string[]>('definitionsAllowList').forEach(ext => extensionsSet.add(ext))
    return extensionsSet
  }

}
