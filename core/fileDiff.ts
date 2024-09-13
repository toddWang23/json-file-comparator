import { DiffLevel, DATA_TYPE } from 'model/dataProcess'
import { readPartialFile } from 'util/file'
import { throwErrorWithCode } from 'util/error'
import {
  JSON_COLON_MISS,
  JSON_KEY_NOT_CLOSE,
  JSON_VALUE_ILLEGAL
} from 'constant'
import {
  JSON_COLON_MISS_MSG,
  JSON_KEY_NUMBER_STR_MIX_MSG,
  JSON_VALUE_ILLEGAL_MSG
} from 'constant/errorMessage'
import { getValueEndIndexByType } from './util/valueProcessor'
import { getSectionType } from './util/dataType'

/**
 * loop the JSON string from start index, find name
 * @param sourceStr json string file
 * @param startIndex check start index
 * @returns
 */
const getStringEndIndex = (sourceStr: string, startIndex: number) => {
  let checkingIndex = startIndex
  // cache char at last position for slash check
  let lastChar

  let quoteCounter = 0

  let levelKey = ''

  for (; checkingIndex < sourceStr.length; checkingIndex++) {
    let char = sourceStr[checkingIndex]

    if (/\s/.test(char)) {
      continue
    }

    // everything between quote is ignored
    if (char === '"' && lastChar !== '\\') {
      quoteCounter = 1 - quoteCounter
    }

    //  if the matched char is ", and match quote pair is empty, then the name is found and matched.
    if (char === '"' && lastChar !== '\\' && !quoteCounter) {
      // search the following colon and ignore it when matching value
      // do {
      //   char = sourceStr[++checkingIndex]
      // } while (/\s/.test(char) || char === ':')

      return checkingIndex
    } else if (quoteCounter) {
      // if the quote is not closed, the char should be included into name.
      levelKey += char
    }

    // not appropriate when end of name match, but not matter
    lastChar = char
  }

  return -1
}

/**
 * find the interval space between JSON key and value
 * @param sourceStr source string need to be search
 * @param startIndex checking start index
 * @returns
 */
const getColonSpaceEndIndex = (sourceStr: string, startIndex: number) => {
  const { length } = sourceStr

  for (let i = startIndex; i < length; i++) {
    const char = sourceStr[i]

    if (/[^\s:]/.test(char)) {
      return i
    }
  }
  return -1
}

const getValueEndIndex = (sourceStr: string, startIndex: number) => {
  let checkingIndex = startIndex

  let levelType: DATA_TYPE

  // find the first valid character
  while (/\s/.test(sourceStr[checkingIndex])) {
    checkingIndex++
  }

  const sectionType = getSectionType(sourceStr[checkingIndex])

  if (!sectionType) {
    throwErrorWithCode(
      JSON_VALUE_ILLEGAL,
      JSON_VALUE_ILLEGAL_MSG,
      checkingIndex.toString()
    )
  }

  return getValueEndIndexByType(sourceStr, checkingIndex, levelType!)
}

/**
 * read current level and form next level data
 * @param path reading file path
 * @param levelInfo current checking level info
 * @returns
 */
export const generateLevelDiff = async (
  path: string,
  levelInfo?: DiffLevel
): Promise<DiffLevel[]> => {
  let { startIndex = 0, endIndex = undefined } = levelInfo || {}

  return readPartialFile({
    path,
    start: startIndex,
    end: endIndex
  }).then(levelStr => {
    // use array here to record json keys' order
    const levelDiffArr: DiffLevel[] = []

    const levelType = getSectionType(levelStr[0])

    const { length: stringLength } = levelStr

    if (!levelType) {
      throwErrorWithCode(
        JSON_VALUE_ILLEGAL,
        JSON_VALUE_ILLEGAL_MSG,
        startIndex.toString()
      )
    }

    endIndex = endIndex ? endIndex - 1 : stringLength

    let checkingIndex = (startIndex = startIndex + 1)

    while (checkingIndex < stringLength) {
      const levelDiff: Partial<DiffLevel> = {}

      if ([DATA_TYPE.OBJECT].includes(levelType!)) {
        const attributeNameEndIndex = getStringEndIndex(levelStr, checkingIndex)

        if (attributeNameEndIndex === -1) {
          // exist current match process
          throwErrorWithCode(
            JSON_KEY_NOT_CLOSE,
            JSON_KEY_NUMBER_STR_MIX_MSG,
            checkingIndex.toString()
          )
        }

        levelDiff.attributeName = levelStr
          .substring(checkingIndex, attributeNameEndIndex)
          .trim()
        checkingIndex = attributeNameEndIndex + 1

        // find colon index in string
        const valueStartIndex = getColonSpaceEndIndex(levelStr, checkingIndex)

        if (valueStartIndex === -1) {
          throwErrorWithCode(
            JSON_COLON_MISS,
            JSON_COLON_MISS_MSG,
            checkingIndex.toString()
          )
        }

        checkingIndex = valueStartIndex
      } else if ([DATA_TYPE.ARRAY].includes(levelType!)) {
        levelDiff.attributeName = levelDiffArr.length.toString()
      }
      const levelEnd = getValueEndIndex(levelStr, checkingIndex)

      levelDiff.startIndex = checkingIndex
      levelDiff.endIndex = checkingIndex
      levelDiff.type = getSectionType(levelStr[checkingIndex])
      levelDiffArr.push(levelDiff as DiffLevel)

      checkingIndex = levelEnd
    }

    return levelDiffArr
  })
}

export const compareBasedOnPath = (
  referencePath: string,
  comparedFilePath: string
) => {
  Promise.all([
    generateLevelDiff(referencePath),
    generateLevelDiff(comparedFilePath)
  ]).then(([referenceInfo, compareInfo]) => {})
}
