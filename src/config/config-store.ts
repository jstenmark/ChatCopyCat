import { EventEmitter } from 'events'
import * as vscode from 'vscode'

import { IPackageJson, IProperty, Properties } from './config-utils'

class ConfigStore {
  private configChangeEmitter = new EventEmitter()

  readonly extenisonPublisher: string
  readonly extensionId: string

  private configReadyEmitter = new EventEmitter()
  private configReadyPromise: Promise<void> = new Promise<void>(resolve => {
    this.configReadyEmitter.once('configReady', () => resolve())
  })

  defaultConfig: Record<string, unknown> // loaded first toggether with configObjects from packageJSON
  configObjects: Record<string, IProperty> // never updated after loaded
  configCache: Record<string, unknown>

  constructor(extenisonPublisher: string, extensionId: string) {
    this.extenisonPublisher = extenisonPublisher
    this.extensionId = extensionId
    this.defaultConfig = {} // loaded first. config store
    this.configObjects = {} // for menus etc - metadata
    this.configCache = {} // loads cache with values from workspace

    this.initialize()
      .then(() => {
        this.configReadyEmitter.emit('configReady')
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      .catch(error => vscode.window.showWarningMessage(error.message))
  }

  private async initialize(): Promise<void> {
    await this.getConfigDefaultValuesAndMetaData()
    await this.updateConfigCache()
  }

  public async whenConfigReady(): Promise<void> {
    return this.configReadyPromise
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getConfigDefaultValuesAndMetaData(): Promise<void> {
    const extension = vscode.extensions.getExtension<IPackageJson>(
      this.extenisonPublisher + '.' + this.extensionId,
    )

    if (!extension) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      vscode.window.showErrorMessage('Extension not found in config store')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const properties: Properties = extension.packageJSON.contributes.configuration
      .properties as Record<string, IProperty>

    for (const [key, value] of Object.entries(properties)) {
      const settingKey = key.split('.').pop()!
      this.defaultConfig[settingKey] = value.default
      this.configObjects[settingKey] = value
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async updateConfigCache() {
    const config = this.getConfiguration()
    const newCache = Object.keys(this.defaultConfig).reduce(
      (cache, key) => {
        cache[key] = config.get(key, this.defaultConfig[key])
        return cache
      },
      {} as Record<string, unknown>,
    )
    this.configCache = newCache
    return { config, newCache }
  }

  // eslint-disable-next-line @typescript-eslint/require-await

  /**
   * Registers a listener for config updates.
   * @param listener - A function that will be called when a config update occurs.
   *                   It should expect two parameters: `key` (string) and `value` (unknown).
   *                   It does not need to return anything.
   */
  public get<T>(key: string): T {
    return this.configCache[key] as T
  }

  public async update<T>(key: string, value: T, global = false): Promise<void> {
    await this.getConfiguration().update(key, value, global)
    this.configCache[key] = value
    this.configChangeEmitter.emit('configUpdate', key, value)
  }
  public getConfigObjects(): Properties {
    return this.configObjects
  }
  private getConfiguration() {
    return vscode.workspace.getConfiguration(this.extensionId)
  }
}

export const configStore: ConfigStore = new ConfigStore('JStenmark', 'chatcopycat')

/**
// @LogDecorator('DEBUG' as LogLevel, 'Getting config from packageJson', { truncate: 0 })
public getJsonConfig(): Record<string, unknown> {
  const extension = vscode.extensions.getExtension<IPackageJson>(
    `${this.extenisonPublisher}.${this.extensionId}`,
  )
  if (!extension) {
    vscode.window.showErrorMessage('Extension not found' + this.extensionId)
    console.error('Extension not found')
    return {}
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const properties = extension.packageJSON.contributes.configuration.properties
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.keys(properties).reduce<Record<string, unknown>>((config, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const settingKey = key.split('.').pop()!
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    config[settingKey] = properties[key].default
    return config
  }, {})
}

  //public onConfigReady(listener: (config: Record<string, unknown>) => void) {
  //  this.configChangeEmitter.on('configReady', listener)
  //}
*/

/**
  public onUpdateConfig(listener: (key: string, value: unknown) => void) {
    if (typeof listener === 'function') {
      this.configChangeEmitter.on('configUpdate', listener)
      return () => {
        this.configChangeEmitter.off('configUpdate', listener)
      }
    } else {
      throw new Error('Listener must be a function')
    }
  }


  private async listenForConfigurationChanges() {
    vscode.workspace.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration(this.extensionId)) {
        await this.updateConfigCache()
      }
    })
  }

  */
