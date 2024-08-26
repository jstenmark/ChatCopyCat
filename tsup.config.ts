import {defineConfig} from 'tsup'
import dedent from 'dedent'
import {esbuildDecorators} from "@anatine/esbuild-decorators"

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started')
    })
    build.onEnd(result => {
      result.errors.forEach(({text, location}) => {
        console.error(`✘ [ERROR] ${text}`)
        console.error(`    ${location.file}:${location.line}:${location.column}:`)
      })
      console.log('[watch] build finished')
    })
  }
}

const banner = ({format}) => {
  console.log('FORMAT=', format)
  if (format !== 'esm') return

  return {
    js: dedent`
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);\n
    `,
  }
}

export default defineConfig({
  banner,
  entry: ['src/**/*.ts', '!src/test/**/*.ts'], //include all files under src
  sourcemap: true,
  clean: true,
  splitting: false,
  skipNodeModulesBundle: true,
  outDir: "out",
  external: [
    'vscode',
  ],
  shims: false,
  dts: false,
  format: "cjs",
  esbuildPlugins: [
    esbuildDecorators(),
    esbuildProblemMatcherPlugin
  ],
})
