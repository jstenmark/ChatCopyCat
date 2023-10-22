export function tabifyCode(
  inputString: string,
  tabSpaces: number = 2,
  removeNewlines: boolean = true,
  removeTrailingSpaces: boolean = true
): string {
  const lines: string[] = inputString.split('\n');

  const processedLines = lines.map((line) => {
    let trimmedLine = line;
    if (removeTrailingSpaces) {
      trimmedLine = line.trimRight();
    }

    let indent = 0;
    let pos = 0;

    while (pos < trimmedLine.length && (trimmedLine[pos] === ' ' || trimmedLine[pos] === '\t')) {
      if (trimmedLine[pos] === ' ') {
        indent += 1;
      } else if (trimmedLine[pos] === '\t') {
        indent += tabSpaces;
      }
      pos += 1;
    }

    const lineContent = trimmedLine.substring(pos);
    const numTabs = Math.floor(indent / tabSpaces);
    const spacesLeft = indent % tabSpaces;
    const tabifiedLine = `${'\t'.repeat(numTabs)}${' '.repeat(spacesLeft)}${lineContent}`;
    return tabifiedLine;
  });

  let output = processedLines.join('\n');

  if (removeNewlines) {
    output = output.replace(/\n\n/g, '\n');
  }

  return output;
}
