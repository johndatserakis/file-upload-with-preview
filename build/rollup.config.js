import scss from 'rollup-plugin-scss'
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

const config = {
    input: 'src/file-upload-with-preview.js',
    output: {
        name: 'FileUploadWithPreview'
    },
    plugins: [
        scss({
            output: 'dist/file-upload-with-preview.min.css'
        }),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true
        })
    ]
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
