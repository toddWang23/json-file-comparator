import { Readable } from 'stream'
import CombinedStream from 'combined-stream'
import { createReadStream, createWriteStream, WriteStream } from 'fs'
import { WritableData } from './type'
import { throwErrorWithCode } from 'util/error'
import { WRITE_FILE_ERROR } from 'constant/errCode'
import { WRITE_FILE_ERROR_MSG } from 'constant/errorMessage'

/**
 * combine series of content into one readstream
 * @param readableArr array of content config
 * @returns
 */
const formReadableSeries = (readableArr: WritableData[]) => {
  const combinedReadStream = CombinedStream.create()

  for (const readableInfo of readableArr) {
    if (typeof readableInfo === 'string') {
      let content = readableInfo

      combinedReadStream.append(
        new Readable({
          read(size) {
            if (content.length === 0) {
              this.push(null)
            } else {
              this.push(content.slice(0, size))
              content = content.slice(size)
            }
          }
        })
      )
    } else {
      const { fromPath, startIndex = 0, endIndex } = readableInfo!
      const fileReadStream = createReadStream(fromPath, {
        start: startIndex,
        end: endIndex
      })

      combinedReadStream.append(fileReadStream)
    }
  }
  return combinedReadStream
}

export class FileWriteStack {
  private taskQueue: CombinedStream[]

  private writeStream: WriteStream

  // is writing content in
  private isWriting: boolean

  constructor(writePath: string) {
    this.taskQueue = []
    this.writeStream = createWriteStream(writePath, {
      flags: 'w+'
    })
    this.isWriting = false
  }

  private performTask() {
    // if another readstream is writing, wait for ongoing done to call it
    if (this.isWriting) {
      return
    }

    const task = this.taskQueue.shift()

    if (task) {
      task.pipe(this.writeStream, { end: false })

      task.on('end', () => {
        this.isWriting = false
        this.performTask()
      })

      task.on('error', err => {
        throwErrorWithCode(
          WRITE_FILE_ERROR,
          WRITE_FILE_ERROR_MSG,
          err.message,
          err.stack?.toString?.() || ''
        )
      })
    }
  }

  /**
   * add content to stack and run processor
   * @param contentArr content need to be written to file
   */
  pushReadStream(contentArr: WritableData[]) {
    const combinedReadStream = formReadableSeries(contentArr)
    this.taskQueue.push(combinedReadStream)
    this.performTask()
  }
}
