import path from "path";
import ts from "rollup-plugin-typescript2"
import { terser } from "rollup-plugin-terser"

export default {
    input: './index.ts',

    output: [{
        file: path.resolve(__dirname, './dist/index.esm.js'),
        sourcemap: true,
        format: 'esm'
    }, {
        file: path.resolve(__dirname, './dist/index.cjs.js'),
        sourcemap: true,
        format: 'cjs'
    }],

    plugins: [
        ts(),
        terser(),
    ]
}