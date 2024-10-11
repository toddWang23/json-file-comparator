import {
  CHUNK_SIZE,
  COMPARE_PARAM,
  OUTPUT_PARAM,
  REFERENCE_PARAM
} from './constant/param'
import { getParamFromStr } from './util'
import compareFile from './index'
const param = process.argv.slice(2)

const {
  [REFERENCE_PARAM]: referencePath,
  [COMPARE_PARAM]: comparedFilePath,
  [OUTPUT_PARAM]: outputPath,
  [CHUNK_SIZE]: chunkSize
} = getParamFromStr(param)

// passed in file read size
const readSize = Number(chunkSize)

compareFile(
  referencePath,
  comparedFilePath,
  outputPath,
  isNaN(readSize) ? undefined : readSize
).then(() => {
  console.log('compare result is written into', outputPath)
})
