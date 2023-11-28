export interface ILanguagePort {
  getLanguages(): Promise<string[]>;
}