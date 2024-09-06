import { createReadStream } from 'fs'
import { access, constants } from 'fs'
import { FileReadOption } from './type'

/**
 * check path passed-in is valid or not
 * @param filePath file path to check
 * @returns
 */
export const isValidPath = (filePath: string): Promise<boolean> =>
  new Promise(resolve =>
    access(filePath, constants.R_OK, err => {
      resolve(!!err)
    })
  )

/**
 * read file partially based on file byte index
 * @param options configuration for file reading
 */
export const readPartialFile = (options: FileReadOption): Promise<string> => {
  const { path, start = 0, end = Infinity } = options

  const referenceRS = createReadStream(path, {
    encoding: 'utf-8',
    start,
    end
  })
}
