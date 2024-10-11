import { JSON_KEY_REPEAT } from 'constant/errCode'
import { JSON_KEY_REPEAT_MSG } from 'constant/errorMessage'
import { DATA_TYPE, JsonLevel } from 'model/dataProcess'
import { DIFF_RESULT, LevelDiffResult } from 'model/diff'
import { throwErrorWithCode } from 'util/error'
import { ValueCompare } from './type'
import { createReadStream } from 'fs'
import { READ_CHUNK_SIZE } from 'constant/file'

/**
 * compare two chunk result, return whether they are equal or not
 * @param first first compare element
 * @param second second compare element
 * @returns
 */
const compareContentByIndex = async (
  first: ValueCompare,
  second: ValueCompare,
  readSize?: number
): Promise<boolean> => {
  const {
    startIndex: firstStartIndex,
    endIndex: firstEndIndex,
    path: firstFilePath
  } = first

  const {
    startIndex: secondStartIndex,
    endIndex: secondEndIndex,
    path: secondFilePath
  } = second

  const firstStream = createReadStream(firstFilePath, {
    start: firstStartIndex,
    end: firstEndIndex,
    encoding: 'utf8',
    highWaterMark: readSize || READ_CHUNK_SIZE
  })

  const secondStream = createReadStream(secondFilePath, {
    start: secondStartIndex,
    end: secondEndIndex,
    encoding: 'utf8',
    highWaterMark: readSize || READ_CHUNK_SIZE
  })

  const chunkData: Record<string, string | undefined> = {
    firstChunk: undefined,
    secondChunk: undefined
  }

  // if stream is closed but underline file keep feeding
  let isStreamClosed = false

  let streamEndCounter = 0

  return new Promise(resolve => {
    /**
     * compare data during data stream chunk flowing
     */
    const onStreamDataCompare = () => {
      const { firstChunk = '', secondChunk = '' } = chunkData

      // because compare value are same length, then it will execute now and then
      if (
        secondChunk !== undefined &&
        secondChunk.length === firstChunk.length
      ) {
        // start to compare
        if (firstChunk !== secondChunk) {
          secondStream.close()
          firstStream.close()
          resolve(false)
        } else {
          chunkData.firstChunk = undefined
          chunkData.secondChunk = undefined
        }
      }
    }

    /**
     * stream end check compare result
     */
    const onStreamEnd = () => {
      streamEndCounter++

      if (streamEndCounter === 2) {
        resolve(chunkData.firstChunk === chunkData.secondChunk)
      }
    }

    firstStream.addListener('data', chunkStr => {
      if (isStreamClosed) {
        return
      }

      chunkData.firstChunk = (chunkData.firstChunk || '') + chunkStr.toString()
      onStreamDataCompare()
    })

    firstStream.addListener('end', () => {
      onStreamEnd()
    })

    secondStream.addListener('data', chunkStr => {
      if (isStreamClosed) {
        return
      }
      chunkData.secondChunk =
        (chunkData.secondChunk || '') + chunkStr.toString()
      onStreamDataCompare()
    })

    secondStream.addListener('end', () => {
      onStreamEnd()
    })
  })
}

/**
 * compare difference level info
 * @param referenceDiffInfo reference JSON level info
 * @param compareDiffInfo compared JSON level info
 * @returns {DIFF_RESULT}
 */
export const compareDataInLevel = async (
  referenceDiffInfo: JsonLevel[],
  compareDiffInfo: JsonLevel[],
  referencePath: string,
  comparePath: string,
  readSize?: number
): Promise<LevelDiffResult[]> => {
  const result: LevelDiffResult[] = []

  // TODO: improve the performance here
  const referenceObj = referenceDiffInfo.reduce(
    (formedData, levelInfo, index) => {
      const { attributeName } = levelInfo
      // levelInfo.index = index
      formedData[attributeName] = levelInfo as JsonLevel & { index: number }
      formedData[attributeName].index = index

      return formedData
    },
    {} as Record<string, JsonLevel & { index: number }>
  )

  let lastIndex = -1

  for (let i = 0; i < compareDiffInfo.length; i++) {
    const {
      attributeName: compareAttrName,
      type: compareType,
      startIndex: compareStartIndex,
      endIndex: compareEndIndex
    } = compareDiffInfo[i]

    const referenceInfo = referenceObj[compareAttrName]

    // if the node is deleted
    if (!referenceInfo) {
      result.push({
        type: DIFF_RESULT.ADD,
        attribute: compareAttrName,
        compareEndFileIndex: compareEndIndex,
        compareStartFileIndex: compareStartIndex,
        isLeaf: true // if it's added, then always print what it is
      })
      continue
    }

    const {
      index,
      type: referenceType,
      startIndex: referenceStartIndex,
      endIndex: referenceEndIndex
    } = referenceInfo

    delete referenceObj[compareAttrName]

    // record data should not be reuse, means attribute is repeated
    if (index === lastIndex) {
      throwErrorWithCode(
        JSON_KEY_REPEAT,
        JSON_KEY_REPEAT_MSG,
        referenceInfo.startIndex.toString()
      )
    }

    const isMoved = index < lastIndex

    const isComparableType =
      [DATA_TYPE.NUMBER, DATA_TYPE.STRING].includes(compareType) ||
      [DATA_TYPE.NUMBER, DATA_TYPE.STRING].includes(referenceType)

    // if it's comparable, like string/number, compare them
    if (
      compareType === referenceType &&
      isComparableType &&
      compareEndIndex - compareStartIndex ===
        referenceEndIndex - referenceStartIndex
    ) {
      const isTwoPartEqual = await compareContentByIndex(
        {
          path: referencePath,
          startIndex: referenceStartIndex,
          endIndex: referenceEndIndex
        },
        {
          path: comparePath,
          startIndex: compareStartIndex,
          endIndex: compareEndIndex
        },
        readSize
      )

      if (isTwoPartEqual) {
        // if it's object, it depends on subtle value
        result.push({
          type: isMoved ? DIFF_RESULT.MOVED : DIFF_RESULT.SAME,
          attribute: compareAttrName,
          isLeaf: true,
          ...(isMoved
            ? {
                prevIndex: index,
                changedIndex: i
              }
            : {})
        })
      } else {
        result.push({
          type: isMoved ? DIFF_RESULT.MOVED_CHANGE : DIFF_RESULT.VALUE_CHANGE,
          attribute: compareAttrName,
          isLeaf: true,
          refStartFileIndex: referenceStartIndex,
          refEndFileIndex: referenceEndIndex,
          compareEndFileIndex: compareEndIndex,
          compareStartFileIndex: compareStartIndex
        })
      }
    } else {
      const diffType = isMoved
        ? isComparableType
          ? DIFF_RESULT.MOVED_CHANGE
          : DIFF_RESULT.MOVED
        : isComparableType
          ? DIFF_RESULT.VALUE_CHANGE
          : DIFF_RESULT.UNDEFINED

      result.push({
        type: diffType,
        attribute: compareAttrName,
        isLeaf: isComparableType,
        refStartFileIndex: referenceStartIndex,
        refEndFileIndex: referenceEndIndex,
        compareEndFileIndex: compareEndIndex,
        compareStartFileIndex: compareStartIndex
      })
    }
  }

  // remaining attributes should be pushed to result
  result.push(
    ...Object.entries(referenceObj).map(([attrName, reference]) => {
      const { startIndex: referenceStartIndex, endIndex: referenceEndIndex } =
        reference
      return {
        attribute: attrName,
        type: DIFF_RESULT.REMOVED,
        refStartFileIndex: referenceStartIndex,
        refEndFileIndex: referenceEndIndex,
        isLeaf: true // removed node is set to leaf
      }
    })
  )

  return result
}
