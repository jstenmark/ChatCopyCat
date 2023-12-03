import glob from 'glob'
import Mocha from 'mocha'
import * as path from 'path'

export const run = (): Promise<void> => {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  })

  const testsRoot = path.resolve(__dirname, '..')


  return new Promise<void>((resolve, reject) => {
    glob('**/**.test.js', {cwd: testsRoot}, (error: Error | null, result: string[]) => {
      if (error) {
        console.error('Error while searching for test files',error)
        return reject(error)
      }

      try {
        result.forEach(file => mocha.addFile(path.resolve(testsRoot, file)))
        mocha.run(failures => failures > 0 ? reject(new Error(`${failures} tests failed.`)) : resolve())
       } catch (e) {
        reject(e)
      }
    })
  })
}
