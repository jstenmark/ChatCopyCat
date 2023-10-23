export function tabifyCode(inputString: string, tabSpaces: number = 2, removeNewlines: boolean = true, removeTrailingSpaces: boolean = true): string {
  const lines: string[] = inputString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  const processedLines = lines.map(line => {
    let trimmedLine = line;
    if (removeTrailingSpaces) {
      trimmedLine = line.trimRight();
    }

    const leadingSpacesOrTabs = trimmedLine.match(/^[ \t]*/);
    const indent = leadingSpacesOrTabs ? leadingSpacesOrTabs[0].replace('\t', ' '.repeat(tabSpaces)).length : 0;

    const lineContent = trimmedLine.substring(indent);
    const numTabs = Math.floor(indent / tabSpaces);
    const spacesLeft = indent - numTabs * tabSpaces;
    const tabifiedLine = `${'\t'.repeat(numTabs)}${' '.repeat(spacesLeft)}${lineContent}`;
    return tabifiedLine;
  });

  let output = processedLines.join('\n');

  if (removeNewlines) {
    output = output.replace(/\n\n/g, '\n');
  }

  // TODO: Fix so the document doesnt change
  return output;
}
