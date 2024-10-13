#!/usr/bin/env node
const {
  CHUNK_SIZE,
  COMPARE_PARAM,
  OUTPUT_PARAM,
  REFERENCE_PARAM
} = require('./constant/param')

const { getParamFromStr } = require('./util')
const { compareJSON2File } = require('./index')

const param = process.argv.slice(2)

const {
  [REFERENCE_PARAM]: referencePath,
  [COMPARE_PARAM]: comparedFilePath,
  [OUTPUT_PARAM]: outputPath,
  [CHUNK_SIZE]: chunkSize
} = getParamFromStr(param)

console.log(referencePath, comparedFilePath, outputPath, chunkSize)

// passed in file read size
const readSize = Number(chunkSize)

compareJSON2File(
  referencePath,
  comparedFilePath,
  outputPath,
  isNaN(readSize) ? undefined : readSize
).then(() => {
  console.log('compare result is written into', outputPath)
})
