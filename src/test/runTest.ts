import * as path from 'path'

import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index')

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    })
  } catch (err) {
    console.error(err)
    console.error('Failed to run tests')
    process.exit(1)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
