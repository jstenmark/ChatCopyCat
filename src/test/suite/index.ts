import glob from 'glob'
import Mocha from 'mocha'
import * as path from 'path'

export const run = (): Promise<void> => {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  })

  const testsRoot = path.resolve(__dirname, '..')
  let err: Error | null = null
  let files: string[] = []

  return new Promise<void>((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (error: Error | null, result: string[]) => {
      err = error
      files = result

      if (err) {
        console.error('Error while searching for test files:', err.message)
        console.error('Error while searching for test files:', err.message)
        console.error('Error while searching for test files:', err.message)
        return reject(err)
      }
      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`))
          } else {
            resolve()
          }
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  })
}
