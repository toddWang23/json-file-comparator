import { NO_READ_AUTH_MSG } from 'constant/errorMessage'
import { INVALID_PATH_CODE } from './constant/errCode'
import { COMPARE_PARAM, OUTPUT_PARAM, REFERENCE_PARAM } from './constant/param'
import { getParamFromStr } from './util'
import { isValidPath } from './util/file'
import { throwErrorWithCode } from 'util/error'
import { compareFileWrite2File } from 'core'

const param = process.argv.slice(2)

const {
  [REFERENCE_PARAM]: referencePath,
  [COMPARE_PARAM]: comparedFilePath,
  [OUTPUT_PARAM]: outputPath
} = getParamFromStr(param)

Promise.all([isValidPath(referencePath), isValidPath(comparedFilePath)]).then(
  ([isReferenceValid, isComparedPathValid]) => {
    if (!isComparedPathValid) {
      throwErrorWithCode(INVALID_PATH_CODE, NO_READ_AUTH_MSG, comparedFilePath)
    }

    if (!isReferenceValid) {
      throwErrorWithCode(INVALID_PATH_CODE, NO_READ_AUTH_MSG, referencePath)
    }

    // compareBasedOnPath(referencePath, comparedFilePath)
    compareFileWrite2File(referencePath, comparedFilePath, outputPath)
  }
)
