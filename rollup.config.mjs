import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import PeerDepsExternalPlugin from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import preserveDirectives from 'rollup-plugin-preserve-directives'

const plugins = [
  postcss({
    extract: false,
    modules: true,
    use: ['sass'],
  }),
  commonjs(),
  PeerDepsExternalPlugin(),
  resolve(),
  preserveDirectives.default(),
  terser(),
]

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        interop: 'auto',
        preserveModules: true,
        sourcemap: true,
      },
    ],
    plugins: [
      ...plugins,
      typescript({ tsconfig: './rollup.tsconfig.cjs.json' }),
    ],
    onwarn(warning, warn) {
      if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
        warn(warning)
      }
    },
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        interop: 'auto',
        preserveModules: true,
        sourcemap: true,
      },
    ],
    plugins: [
      ...plugins,
      typescript({ tsconfig: './rollup.tsconfig.esm.json' }),
    ],
    onwarn(warning, warn) {
      if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
        warn(warning)
      }
    },
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]
