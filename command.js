#!/usr/bin/env node
const { compareJSON2File } = require('./index')

/**
 * convert command parameter to key-value pair object
 * @param inputArr input parameter array
 * @returns
 */
const getParamFromStr = (inputArr) =>
  inputArr.reduce((prev, inputStr) => {
    if (inputStr.startsWith('--')) {
      const paramStr = inputStr.substring(2)
      const [key, value] = paramStr.split('=')

      if (key) {
        return {
          ...prev,
          [key.trim()]: value.trim()
        }
      }
    }

    return prev
  }, {})


//  compare standard file path
const REFERENCE_PARAM = 'reference'

// compared file path
const COMPARE_PARAM = 'compare'

// output path for compare result file
const OUTPUT_PARAM = 'output'

// read file chunk size
const CHUNK_SIZE = 'size'

const param = process.argv.slice(2)

const {
  [REFERENCE_PARAM]: referencePath,
  [COMPARE_PARAM]: comparedFilePath,
  [OUTPUT_PARAM]: outputPath,
  [CHUNK_SIZE]: chunkSize
} = getParamFromStr(param)


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
