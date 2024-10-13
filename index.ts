import {
  COMP_FILE_PATH_REQUIRED_MSG,
  NO_READ_AUTH_MSG,
  OUT_FILE_PATH_REQUIRED_MSG,
  REF_FILE_PATH_REQUIRED_MSG
} from 'constant/errorMessage'
import {
  COMP_FILE_PATH_REQUIRED,
  INVALID_PATH_CODE,
  OUT_FILE_PATH_REQUIRED,
  REF_FILE_PATH_REQUIRED
} from './constant/errCode'
import { isValidPath } from './util/file'
import { throwErrorWithCode } from 'util/error'
import { compareFileWrite2File } from 'core'

export const compareJSON2File = async (
  referenceFilePath: string,
  comparedFilePath: string,
  outputPath: string,
  chunkSize?: number
) => {
  if (!referenceFilePath) {
    throwErrorWithCode(
      REF_FILE_PATH_REQUIRED,
      REF_FILE_PATH_REQUIRED_MSG,
      referenceFilePath
    )
  }

  if (!comparedFilePath) {
    throwErrorWithCode(
      COMP_FILE_PATH_REQUIRED,
      COMP_FILE_PATH_REQUIRED_MSG,
      comparedFilePath
    )
  }

  if (!outputPath) {
    throwErrorWithCode(
      OUT_FILE_PATH_REQUIRED,
      OUT_FILE_PATH_REQUIRED_MSG,
      outputPath
    )
  }

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
