import path from "path";
import ts from "rollup-plugin-typescript2"
import { terser } from "rollup-plugin-terser"
import copy from 'rollup-plugin-copy'

export default {
    input: './index.ts',

    output: [{
        file: path.resolve(__dirname, './dist/index.esm.js'),
        sourcemap: true,
        format: 'esm'
    }, {
        file: path.resolve(__dirname, './dist/index.js'),
        sourcemap: true,
        format: 'cjs'
    }],

    plugins: [
        ts(),
        terser(),
        copy({
            targets: [
                { src: 'command.js', dest: 'dist' }
            ]
        })
    ]
}