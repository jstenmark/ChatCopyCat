import {IConfigPort} from '../../domain/ports/config-port'
import {configStore} from '../../infra/config'

export class ConfigAdapter implements IConfigPort {
  get<T>(key: string): T {
    return configStore.get(key)
  }

  async update<T>(key: string, value: T): Promise<void> {
    return configStore.update(key, value)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onConfigReady(): Promise<void> {
    return
  }
}