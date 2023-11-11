interface IConfigurationProperty {
  type: string
  default: unknown
}
type IConfigurationProperties = Record<string, IConfigurationProperty>
export interface IPackageJson {
  contributes: {
    configuration: {
      properties: IConfigurationProperties
    }
  }
}
interface IPackageConfiguration {
  configuration: {
    properties: IConfigurationProperties
  }
}
export interface IPackageJson {
  contributes: IPackageConfiguration
}
