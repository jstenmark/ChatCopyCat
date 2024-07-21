// Parse a single gitignore pattern into a regular expression
function parseGitignorePattern(pattern: string): {regex: RegExp; negated: boolean} {
  // Escape special characters
  pattern = pattern.replace(/[\\-\\[\]{}()+?.\\^$|]/g, '\\$&')

  // Replace ** with a non-greedy wildcard for directories
  pattern = pattern.replace(/\*\*/g, '.*')

  // Replace * with a wildcard for any character except '/'
  pattern = pattern.replace(/\*/g, '[^/]*')

  // Replace ? with a wildcard for any single character except '/'
  pattern = pattern.replace(/\?/g, '[^/]')

  // Check if the pattern is negated
  const isNegated = pattern.startsWith('!')
  if (isNegated) {
    pattern = pattern.substring(1)
  }

  // Add anchors to match the whole string
  pattern = '^' + pattern + '$'

  return {regex: new RegExp(pattern, 'i'), negated: isNegated}
}

// Parse multiple gitignore patterns from content into an array of regular expressions
export function parseGitignorePatterns(content: string): {regex: RegExp; negated: boolean}[] {
  return content
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'))
    .map(parseGitignorePattern)
}

// Check if a given path is ignored based on the provided patterns
export function isIgnored(path: string, patterns: {regex: RegExp; negated: boolean}[]): boolean {
  let isIgnored = false
  for (const {regex, negated} of patterns) {
    if (regex.test(path)) {
      isIgnored = !negated
    }
  }
  return isIgnored
}
