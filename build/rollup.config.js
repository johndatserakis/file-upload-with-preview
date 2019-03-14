// import css from 'rollup-plugin-css-only'
import scss from 'rollup-plugin-scss'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2))

const config = {
    input: 'src/file-upload-with-preview.js',
    output: {
        name: 'FileUploadWithPreview',
        exports: 'named',
        globals: {},
    },
    plugins: [
        commonjs(),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        scss({
            output: 'dist/file-upload-with-preview.min.css'
        }),
        buble(),
    ],
    external: []
}

// Only minify browser (iife) version
if (argv.format === 'iife') {
    config.plugins.push(terser())

    // Here we remove our `external` dependency that we have in this project
    // Be careful with the index here - it has to match any dependency that
    // you want to be built into to the iife output
    // config.external.splice(1)
}

export default config