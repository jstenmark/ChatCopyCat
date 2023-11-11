import * as vscode from 'vscode'
import { IPackageJson } from './config-utils'

export class ConfigStore {
  private readonly extenisonPublisher: string
  private readonly extensionId: string
  private configCache: Record<string, unknown>
  private defaultConfig: Record<string, unknown>

  constructor(extenisonPublisher: string, extensionId: string) {
    this.extenisonPublisher = extenisonPublisher
    this.extensionId = extensionId
    this.defaultConfig = this.getDefaultConfig()
    this.configCache = {}

    this.loadConfiguration()
    this.listenForConfigurationChanges()
  }
  private getDefaultConfig(): Record<string, unknown> {
    const extension = vscode.extensions.getExtension<IPackageJson>(
      `${this.extenisonPublisher}.${this.extensionId}`,
    )
    if (!extension) {
      console.error('Extension not found')
      return {}
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const properties = extension.packageJSON.contributes.configuration.properties
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return Object.keys(properties).reduce(
      (config, key) => {
        const settingKey = key.split('.').pop()
        if (settingKey) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          config[settingKey] = properties[key].default
        }
        return config
      },
      {} as Record<string, unknown>,
    )
  }

  private loadConfiguration() {
    const config = this.getConfiguration()
    this.configCache = Object.keys(this.defaultConfig).reduce(
      (cache, key) => {
        cache[key] = config.get(key, this.defaultConfig[key])
        return cache
      },
      {} as Record<string, unknown>,
    )
  }

  private listenForConfigurationChanges() {
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(this.extensionId)) {
        this.loadConfiguration()
      }
    })
  }

  private getConfiguration() {
    return vscode.workspace.getConfiguration(this.extensionId)
  }

  public get<T>(key: string): T {
    return this.configCache[key] as T
  }

  public async update<T>(key: string, value: T, global = false): Promise<void> {
    await this.getConfiguration().update(key, value, global)
    this.configCache[key] = value
  }

  public getJsonConfig(): Record<string, unknown> {
    const extension = vscode.extensions.getExtension<IPackageJson>(
      `${this.extenisonPublisher}.${this.extensionId}`,
    )
    if (!extension) {
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
      config[settingKey] = this.get(settingKey)
      return config
    }, {})
  }
}
