export interface IConfigPort {
  get<T>(key: string): T;
  update<T>(key: string, value: T): Promise<void>;
  onConfigReady(): Promise<void>
}