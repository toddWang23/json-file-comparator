import { createReadStream, createWriteStream, writeFile } from 'fs'
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
      resolve(!err)
    })
  )

/**
 * read file partially based on file byte index
 * @param options configuration for file reading
 */
export const readPartialFile = (options: FileReadOption): Promise<string> => {
  const { path, start = 0, end = Infinity } = options

  const referenceRS = createReadStream(path, {
    encoding: 'utf8',
    start,
    end
  })

  return new Promise((resolve, reject) => {
    let readString = ''

    referenceRS.addListener('data', data => {
      readString += data
    })

    referenceRS.addListener('close', () => {
      resolve(readString)
    })

    referenceRS.addListener('error', error => {
      reject(error)
    })
  })
}

/**
 * write passed-in file
 * @param path file path need to write in
 * @param content content need to write into file
 * @param isAppending file need to be appended after existing file. default to `true`
 * @returns
 */
export const writeStringIntoFile = (
  path: string,
  content: string,
  isAppending: boolean = true
) =>
  new Promise<undefined>((resolve, reject) => {
    writeFile(
      path,
      content,
      {
        flag: isAppending ? 'a+' : 'w'
      },
      err => {
        if (err) {
          reject(err)
        } else {
          resolve(undefined)
        }
      }
    )
  })

export const writeFileBasedIndex = (
  toPath: string,
  fromPath: string,
  startIndex: number,
  endIndex: number
) => {
  const fileReadStream = createReadStream(fromPath, {
    start: startIndex,
    end: endIndex
  })

  const fileWriteStream = createWriteStream(toPath, {
    flags: 'a+'
  })

  fileReadStream.pipe(fileWriteStream)

  return new Promise((resolve, reject) => {
    fileReadStream.on('error', err => {
      reject(err)
    })
    fileReadStream.on('end', () => {
      resolve(undefined)
    })
  })
}
