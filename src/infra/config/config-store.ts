import {Disposable, EventEmitter, WorkspaceConfiguration, extensions, workspace} from 'vscode'
import {Notify} from '../vscode/notification'
import {IConfigurationProperties, IExtension, IProperty} from './types'
import {log} from '../logging/log-base'
import {SingletonBase} from '../../shared/utils/singleton'
import {errorMessage, errorTypeCoerce} from '../../shared/utils/validate'

/**
 * Manages the configuration settings of the extension.
 * It parses the package.json configuration, listens for changes, and updates the configuration cache.
 */
export class ConfigStore extends SingletonBase implements Disposable {
  private static _instance: ConfigStore
  private configChangeEmitter = new EventEmitter<Record<string, IProperty['default']>>() // todo listen to events
  private configReadyEmitter: EventEmitter<void> = new EventEmitter<void>()

  private configReadyPromise: Promise<void>
  private configLoadSuccess = false
  private begunInit = false

  private defaultConfig: Record<string, IProperty['default']> = {}
  private configCache: Record<string, IProperty['default']> = {}
  private pkgJsonProps: Record<string, IProperty> = {}

  readonly extenisonPublisher: string = 'JStenmark'
  readonly extensionId: string = 'chatcopycat'

  /**
   * Initializes the ConfigStore instance.
   */
  constructor() {
    super()
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

  /**
   * Gets the singleton instance of the ConfigStore.
   * @returns The singleton instance of ConfigStore.
   */
  public static get instance(): ConfigStore {
    if (!this._instance) {
      this._instance = new ConfigStore()
    }
    return this._instance
  }

  /**
   * Initializes the configuration store asynchronously.
   */
  public static async initialize(): Promise<void> {
    await this.instance._initialize()
  }

  /**
   * Internal method to initialize the configuration store.
   */
  private async _initialize(): Promise<void> {
    if (this.begunInit) {
      return
    } else {
      this.begunInit = true
    }
    try {
      await this.parsePkgJsonConfig()
      await this.updateConfigCache()
      await this.listenForConfigurationChanges()
      this.setConfigLoadSuccess(true)
    } catch (error) {
      this.setConfigLoadSuccess(false)
      Notify.error(`Error loading config:${errorMessage(error)}`, true, true)
      throw error
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
   * Sets the configuration load success status and emits the config ready event.
   * @param success - A boolean indicating whether the configuration loaded successfully.
   */
  public setConfigLoadSuccess(success: boolean): void {
    this.configLoadSuccess = success
    this.configReadyEmitter.fire()
  }

  /**
   * Retrieves the current WorkspaceConfiguration.
   * @returns The current WorkspaceConfiguration.
   */
  private getConfiguration(): WorkspaceConfiguration {
    return workspace.getConfiguration(this.extensionId)
  }

  /**
   * Parses the extension's package.json to extract configuration properties.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async parsePkgJsonConfig(): Promise<void> {
    const properties = (
      (extensions.getExtension<IExtension>(
        `${this.extenisonPublisher}.${this.extensionId}`,
      ) as IExtension) || undefined
    )?.packageJSON?.contributes?.configuration?.properties

    if (!properties) {
      Notify.error(`Extension not found in config store`, true, true)
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
        Notify.temporaryStatus(`Config change detected, updating config`)
        await this.updateConfigCache()
      }
    })
  }

  /**
   * Disposes of the resources used by the ConfigStore.
   */
  public dispose(): void {
    ConfigStore.instance.configReadyEmitter.dispose()
    ConfigStore.instance.configChangeEmitter.dispose()
  }
}

/**
 * The singleton instance of the ConfigStore.
 */
export const configStore: ConfigStore = ConfigStore.instance
