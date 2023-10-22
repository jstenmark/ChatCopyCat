import { tabifyCode } from "./utils/tabify-code";

export function handleTypeScriptFile(content: string) {
  const tabifiedContent = tabifyCode(content, 2, true, true);

  return tabifiedContent;
}

export function handleJavaScriptFile(content: string) {
  const tabifiedContent = tabifyCode(content, 2, true, true);

  return tabifiedContent;
}

export function handlePythonFile(content: string) {
  const tabifiedContent = tabifyCode(content, 2, true, true);

  return tabifiedContent;
}
export function defaultHandler(content: string) {
  return content;
}

export function handleFileLanguageId(
  language: string,
  content: string
): string {
  switch (language.toLowerCase()) {
    case "typescript":
      return handleTypeScriptFile(content);
    case "javascript":
      return handleJavaScriptFile(content);
    case "python":
      return handlePythonFile(content);
    default:
      return defaultHandler(content);
  }
}
