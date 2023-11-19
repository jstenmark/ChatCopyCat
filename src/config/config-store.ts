import {
  Disposable,
  EventEmitter,
  WorkspaceConfiguration,
  extensions,
  window,
  workspace,
} from 'vscode'

import { SingletonBase, IConfigurationProperties, IExtension, IProperty } from '../common'
import { log } from '../logging'
import { errorMessage, errorTypeCoerce } from '../utils'

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

  public static get instance(): ConfigStore {
    if (!this._instance) {
      this._instance = new ConfigStore()
    }
    return this._instance
  }

  public static async initialize(): Promise<void> {
    await this.instance._initialize()
  }

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
      log.error('Error loading config:', errorMessage(error))
      await window.showErrorMessage(`Error loading config:${errorMessage(error)}`)
      throw error
    }
  }

  public async onConfigReady(customErrorMessage = ''): Promise<void> {
    try {
      if (this.configLoadSuccess) {
        return
      }
      await this.configReadyPromise
    } catch (error) {
      log.error(`Error during configuration loading:${customErrorMessage}`, error)
      throw errorTypeCoerce(error, customErrorMessage)
    }
  }

  public setConfigLoadSuccess(success: boolean): void {
    this.configLoadSuccess = success
    this.configReadyEmitter.fire()
  }

  private getConfiguration(): WorkspaceConfiguration {
    return workspace.getConfiguration(this.extensionId)
  }

  private async parsePkgJsonConfig(): Promise<void> {
    const properties = (
      (extensions.getExtension<IExtension>(
        `${this.extenisonPublisher}.${this.extensionId}`,
      ) as IExtension) || undefined
    )?.packageJSON?.contributes?.configuration?.properties

    if (!properties) {
      log.error('Extension not found in config store')
      await window.showErrorMessage('Extension not found in config store')
      return
    }

    for (const [key, value] of Object.entries(properties)) {
      const settingKey = key.split('.').pop()!
      this.defaultConfig[settingKey] = value.default
      this.pkgJsonProps[settingKey] = value
    }
  }

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

  public get<T>(key: string): T {
    return this.configCache[key] as T
  }

  public async update<T>(key: string, value: T, global = false): Promise<void> {
    await this.getConfiguration().update(key, value, global)
    this.configCache[key] = value
    this.configChangeEmitter.fire({ key, value })
  }

  public async reset(key: string, global = false): Promise<void> {
    const value = this.defaultConfig[key]
    await this.getConfiguration().update(key, value, global)
    this.configChangeEmitter.fire({ key, value })
  }

  public getPkgJsonProps(): IConfigurationProperties {
    return this.pkgJsonProps
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async listenForConfigurationChanges(): Promise<void> {
    workspace.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration(this.extensionId)) {
        log.info('Config change affecting extension, triggering update ', e)
        await this.updateConfigCache()
      }
    })
  }

  public dispose(): void {
    ConfigStore.instance.configReadyEmitter.dispose()
    ConfigStore.instance.configChangeEmitter.dispose()
  }
}

export const configStore: ConfigStore = ConfigStore.instance
