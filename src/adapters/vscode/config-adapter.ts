import {type IConfigPort} from '../../domain/ports/config-port'
import {configStore} from '../../infra/config/config-store'

export class ConfigAdapter implements IConfigPort {
  get<T>(key: string): T {
    return configStore.get<T>(key)
  }

  async update<T>(key: string, value: T): Promise<void> {
    return configStore.update<T>(key, value)
  }


  async onConfigReady(): Promise<void> {
    return
  }
}
