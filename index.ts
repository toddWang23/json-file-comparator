import { NO_READ_AUTH_MSG } from 'constant/errorMessage'
import { INVALID_PATH_CODE } from './constant/errCode'
import { isValidPath } from './util/file'
import { throwErrorWithCode } from 'util/error'
import { compareFileWrite2File } from 'core'

export const compareJSON2File = async (
  referenceFilePath: string,
  comparedFilePath: string,
  outputPath: string,
  chunkSize?: number
) => {
  Promise.all([
    isValidPath(referenceFilePath),
    isValidPath(comparedFilePath)
  ]).then(([isReferenceValid, isComparedPathValid]) => {
    if (!isComparedPathValid) {
      throwErrorWithCode(INVALID_PATH_CODE, NO_READ_AUTH_MSG, comparedFilePath)
    }

    if (!isReferenceValid) {
      throwErrorWithCode(INVALID_PATH_CODE, NO_READ_AUTH_MSG, referenceFilePath)
    }

    return compareFileWrite2File(
      referenceFilePath,
      comparedFilePath,
      outputPath,
      chunkSize
    )
  })
}
