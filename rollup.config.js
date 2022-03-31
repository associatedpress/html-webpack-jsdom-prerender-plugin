import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import autoExternal from 'rollup-plugin-auto-external'

export default {
  input: './src/index.js',
  output: [
    {
      dir: 'dist/',
      format: 'cjs',
      exports: 'default',
    },
  ],
  plugins: [
    autoExternal(),
    resolve({
      browser: true,
      moduleDirectories: [
        'node_modules',
      ],
    }),
    babel({
      babelHelpers: 'inline',
      exclude: 'node_modules/**',
    }),
    commonjs(),
  ],
}
