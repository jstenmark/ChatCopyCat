export function handleTypeScriptFile(content: string) {
  return content;
}

export function handleJavaScriptFile(content: string) {
  return content;
}

export function handlePythonFile(content: string) {
  return content;
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
