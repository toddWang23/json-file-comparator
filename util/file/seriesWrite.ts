import { Readable } from 'stream'
import CombinedStream from 'combined-stream'
import { createReadStream, createWriteStream, WriteStream } from 'fs'
import { WritableData } from './type'

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

class FileWriteStack {
  private taskQueueMap: Map<string, CombinedStream[]>

  private writeStreamMap: Map<string, WriteStream>

  constructor() {
    this.taskQueueMap = new Map()
    this.writeStreamMap = new Map()
  }

  /**
   * add content to stack and run processor
   * @param writePath destination path
   * @param contentArr content need to be written to file
   */
  pushReadStream(writePath: string, contentArr: WritableData[]) {
    const combinedReadStream = formReadableSeries(contentArr)

    if (this.taskQueueMap.has(writePath)) {
      this.taskQueueMap.get(writePath)!.push(combinedReadStream)
    } else {
      this.taskQueueMap.set(writePath, [combinedReadStream])
    }

    if (!this.writeStreamMap.has(writePath)) {
      const fileWriteStream = createWriteStream(writePath, {
        flags: 'a+'
      })
      this.writeStreamMap.set(writePath, fileWriteStream)
    }
  }
}
