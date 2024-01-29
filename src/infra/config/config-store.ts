import {Disposable, EventEmitter, TextDocument, WorkspaceConfiguration, extensions, workspace, ConfigurationScope} from 'vscode'
import {Notify} from '@infra/vscode/notification'
import {IConfigurationProperties, IExtension, IProperty} from '@infra/config/types'
import {log} from '@infra/logging/log-base'
import {errorMessage, errorTypeCoerce} from '@shared/utils/validate'
import {ILangOpts} from '@shared/types/types'
import {defaultTabSize, extId, extPublisher} from '@shared/constants/consts'
import {SingletonMixin} from '@shared/utils/singleton'

/**
 * Manages the configuration settings of the extension.
 * It parses the package.json configuration, listens for changes, and updates the configuration cache.
 */
class ConfigStore implements Disposable {
  private configChangeEmitter = new EventEmitter<Record<string, IProperty['default']>>() // todo listen to events
  private configReadyEmitter: EventEmitter<void> = new EventEmitter<void>()

  private configReadyPromise: Promise<void> = Promise.resolve()
  private configLoadSuccess = false
  private begunInit = false
  private defaultConfig: Record<string, IProperty['default']> = {}
  private configCache: Record<string, IProperty['default']> = {}
  private pkgJsonProps: Record<string, IProperty> = {}

  private readonly extensionPublisher: string = extPublisher
  private readonly extensionId: string = extId


  /**
   * Initializes the configuration store asynchronously.
   */
  public async initialize(): Promise<void> {
    await this._initialize()
  }

  /**
   * Internal method to initialize the configuration store.
   */
  private async _initialize(): Promise<void> {
    if (this.begunInit) {
      return
    }
    this.begunInit = true
    if (!this.configLoadSuccess) {
      this.configReadyPromise = new Promise<void>((resolve, reject) => {
        this.configReadyEmitter.event(() => {
          if (this.configLoadSuccess) {
            log.info('Config Loaded. Initializing extension...')
            resolve()
          } else {
            log.error('Config NOT Loaded...')
            reject(new Error('Failed to load configuration'))
          }
        })
      })
    }

    try {
      await this.parsePkgJsonConfig()
      await this.updateConfigCache()
      await this.listenForConfigurationChanges()
      this.configLoadSuccess = true
    } catch (error) {
      this.configLoadSuccess = false
      Notify.error(`Error loading config:${errorMessage(error)}`, true, true)
      throw error
    } finally {
      this.configReadyEmitter.fire()
    }
  }

  /**
   * Waits for the configuration to be ready.
   * @param customErrorMessage - An optional custom error message for logging purposes.
   */
  public async onConfigReady(customErrorMessage = ''): Promise<void> {
    try {
      if (this.configLoadSuccess) {
        return
      }
      await this.configReadyPromise
    } catch (error) {
      Notify.error(`Error during configuration loading:${errorMessage(error)}`, true, true)
      throw errorTypeCoerce(error, customErrorMessage)
    }
  }

  /**
   * Retrieves the current WorkspaceConfiguration.
   * @returns The current WorkspaceConfiguration.
   */
  private getConfiguration(section:string = this.extensionId, scope?: ConfigurationScope | null | undefined): WorkspaceConfiguration {
    return workspace.getConfiguration(section,scope)
  }

  /**
   * Parses the extension's package.json to extract configuration properties.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async parsePkgJsonConfig(): Promise<void> {
    const properties = (
      (extensions.getExtension<IExtension>(
        `${this.extensionPublisher}.${this.extensionId}`,
      ) as IExtension) || undefined
    )?.packageJSON?.contributes?.configuration?.properties

    if (!properties) {
      Notify.error('Extension not found in config store', true, true)
      return
    }

    for (const [key, value] of Object.entries(properties)) {
      const settingKey = key.split('.').pop()!
      this.defaultConfig[settingKey] = value.default
      this.pkgJsonProps[settingKey] = value
    }
  }

  /**
   * Updates the internal configuration cache with current workspace settings.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async updateConfigCache(): Promise<void> {
    const config: WorkspaceConfiguration = this.getConfiguration()

    this.configCache = Object.keys(this.defaultConfig).reduce(
      (cache, key) => {
        cache[key] = config.get(key, this.defaultConfig[key])
        return cache
      },
      {} as Record<string, IProperty['default']>,
    )
  }

  public getLangOpts(document: TextDocument): ILangOpts {
    const editorConfig = this.getConfiguration('editor', document.uri)

    const tabSize = editorConfig.get<number>('tabSize', defaultTabSize)
    const insertSpaces = editorConfig.get<boolean>('insertSpaces', true)
    const language = document.languageId

    return {tabSize, insertSpaces, language}
  }

  /**
   * Retrieves a configuration value.
   * @param key - The configuration key to retrieve.
   * @returns The configuration value.
   */
  public get<T>(key: string): T {
    return this.configCache[key] as T
  }

  /**
   * Retrieves a default config value
   * @param key - The configuration key to retrieve.
   * @returns The configuration value.
   */
  public getDefault<T>(key: string): T {
    return this.defaultConfig[key] as T
  }

  /**
   * Updates a configuration value.
   * @param key - The configuration key to update.
   * @param value - The new value to set.
   * @param global - Whether to update the configuration globally or per workspace.
   */
  public async update<T>(key: string, value: T, global = false): Promise<void> {
    await this.getConfiguration().update(key, value, global)
    this.configCache[key] = value
    this.configChangeEmitter.fire({key, value})
  }

  /**
   * Resets a configuration value to its default.
   * @param key - The configuration key to reset.
   * @param global - Whether to reset the configuration globally.
   */
  public async reset(key: string, global = false): Promise<void> {
    const value = this.defaultConfig[key]
    await this.update(key, value, global)
  }

  /**
   * Retrieves the configuration properties from package.json.
   * @returns An object containing configuration properties.
   */
  public getPkgJsonProps(): IConfigurationProperties {
    return this.pkgJsonProps
  }

  /**
   * Listens for changes in the configuration and updates the cache accordingly.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async listenForConfigurationChanges(): Promise<void> {
    workspace.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration(this.extensionId)) {
        Notify.temporaryStatus('Config change detected, updating config')
        await this.updateConfigCache()
      }
    })
  }

  /**
   * Disposes of the resources used by the ConfigStore.
   */
  public dispose(): void {
    this.configReadyEmitter.dispose()
    this.configChangeEmitter.dispose()
  }
}

/**
 * The singleton instance of the ConfigStore.
 */

export const ConfigStoreSingleton = SingletonMixin(ConfigStore)
export const configStore: ConfigStore = ConfigStoreSingleton.instance
