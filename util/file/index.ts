import { createReadStream } from 'fs'
import { access, constants } from 'fs'
import { FileReadOption } from './type'
import { READ_CHUNK_SIZE } from 'constant/file'

/**
 * check path passed-in is valid or not
 * @param filePath file path to check
 * @returns
 */
export const isValidPath = (filePath: string): Promise<boolean> =>
  new Promise(resolve =>
    access(filePath, constants.R_OK, err => {
      resolve(!err)
    })
  )

/**
 * read file partially based on file byte index
 * @param options configuration for file reading
 */
export const readPartialFile = <T>(
  options: FileReadOption,
  filter: (content: string, accumulation: T) => T,
  initAccumulationValue: T
): Promise<T> => {
  const {
    path,
    start = 0,
    end = Infinity,
    readSize = READ_CHUNK_SIZE
  } = options

  const referenceRS = createReadStream(path, {
    encoding: 'utf8',
    start,
    end,
    highWaterMark: readSize
  })

  return new Promise((resolve, reject) => {
    let accumulation: T = initAccumulationValue

    referenceRS.addListener('data', data => {
      accumulation = filter(data.toString(), accumulation)
    })

    referenceRS.addListener('close', () => {
      resolve(accumulation)
    })

    referenceRS.addListener('error', error => {
      reject(error)
    })
  })
}
