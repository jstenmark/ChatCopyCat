import {resolve} from 'path'

import {runTests} from '@vscode/test-electron'

async function main() {
  try {
    const extensionDevelopmentPath = resolve(__dirname, '../../')
    const extensionTestsPath = resolve(__dirname, './suite/run')

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions']
    })
  } catch (e) {
    console.error('Failed to run tests', e)
    process.exit(1)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
