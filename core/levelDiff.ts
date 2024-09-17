import { JSON_KEY_REPEAT } from 'constant'
import { JSON_KEY_REPEAT_MSG } from 'constant/errorMessage'
import { DATA_TYPE, JsonLevel } from 'model/dataProcess'
import { DIFF_RESULT, LevelDiffResult } from 'model/diff'
import { throwErrorWithCode } from 'util/error'
import { readPartialFile } from 'util/file'

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
  comparePath: string
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
      const [referenceValue, compareValue] = await Promise.all([
        readPartialFile({
          path: referencePath,
          start: referenceStartIndex,
          end: referenceEndIndex
        }),
        readPartialFile({
          path: comparePath,
          start: compareStartIndex,
          end: compareEndIndex
        })
      ])

      if (referenceValue === compareValue) {
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
      result.push({
        type: isMoved ? DIFF_RESULT.MOVED_CHANGE : DIFF_RESULT.VALUE_CHANGE,
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
