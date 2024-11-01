import {
  COMP_FILE_PATH_REQUIRED_MSG,
  NO_READ_AUTH_MSG,
  OUT_FILE_CREATE_FAILED_MSG,
  OUT_FILE_PATH_REQUIRED_MSG,
  REF_FILE_PATH_REQUIRED_MSG
} from 'constant/errorMessage'
import {
  COMP_FILE_PATH_REQUIRED,
  INVALID_PATH_CODE,
  OUT_FILE_CREATE_FAILED,
  OUT_FILE_PATH_REQUIRED,
  REF_FILE_PATH_REQUIRED
} from './constant/errCode'
import { isValidPath } from './util/file'
import { throwErrorWithCode } from 'util/error'
import { compareFileWrite2File } from './core'
import { access, constants, open } from 'fs'

/**
 * check compare result file path, create one if not exist.
 * @param outputPath compare output file path
 * @returns
 */
const isOutputPathValid = (outputPath: string) =>
  new Promise(resolve => {
    access(outputPath, constants.W_OK, err => {
      // if error during accessing file, need to create file first
      if (err) {
        open(outputPath, 'w', createErr => {
          if (createErr) {
            resolve(false)
          } else {
            resolve(true)
          }
        })
      } else {
        resolve(true)
      }
    })
  })

/**
 * compare `comparedFilePath` with `referenceFilePath`, and write compare result into `outputPath` file.
 * @param referenceFilePath reference file path.
 * @param comparedFilePath compare file path
 * @param outputPath compare result file path
 * @param chunkSize file read chunk size in byte
 */
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

  return Promise.all([
    isValidPath(referenceFilePath),
    isValidPath(comparedFilePath),
    isOutputPathValid(outputPath)
  ]).then(([isReferenceValid, isComparedPathValid, isOutputPathValid]) => {
    if (!isComparedPathValid) {
      throwErrorWithCode(INVALID_PATH_CODE, NO_READ_AUTH_MSG, comparedFilePath)
    }

    if (!isReferenceValid) {
      throwErrorWithCode(INVALID_PATH_CODE, NO_READ_AUTH_MSG, referenceFilePath)
    }

    if (!isOutputPathValid) {
      throwErrorWithCode(
        OUT_FILE_CREATE_FAILED,
        OUT_FILE_CREATE_FAILED_MSG,
        outputPath
      )
    }

    return compareFileWrite2File(
      referenceFilePath,
      comparedFilePath,
      outputPath,
      chunkSize
    )
  })
}
