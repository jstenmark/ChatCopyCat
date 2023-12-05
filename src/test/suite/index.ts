import Mocha from 'mocha'
import * as path from 'path'
import {Glob} from 'glob'

export const run = async (): Promise<void> => {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  })

  try {
    const testsRoot = path.resolve(__dirname, '..')
    const testFiles = new Glob('**/*.test.js', {cwd: testsRoot})

    for await (const file of testFiles) {
      mocha.addFile(path.resolve(testsRoot, file))
    }
  } catch (error) {
    console.error('Error adding files to testrunner', error);
    throw error;
  }

  return new Promise((resolve, reject) => {
    mocha.run(failures => failures > 0 ? reject(new Error(`${failures} tests failed.`)) : resolve())
  })
}
