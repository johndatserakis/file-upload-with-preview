import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import scss from 'rollup-plugin-scss';

import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const name = 'FileUploadWithPreview';

export default {
  external: [],
  input: './src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: pkg.browser,
      format: 'iife',
      globals: {}, // https://rollupjs.org/guide/en#output-globals-g-globals
      name,
    },
  ],
  plugins: [
    scss({ output: 'dist/index.min.css' }),
    resolve({ extensions }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions,
      include: ['src/**/*'],
      runtimeHelpers: true,
    }),
  ],
};
