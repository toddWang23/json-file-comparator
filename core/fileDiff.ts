import { JsonLevel, DATA_TYPE } from 'model/dataProcess'
import { readPartialFile } from 'util/file'
import { throwErrorWithCode } from 'util/error'
import {
  JSON_COLON_MISS,
  JSON_KEY_NO_QUOTE_PREFIX,
  JSON_KEY_NOT_CLOSE,
  JSON_VALUE_ILLEGAL
} from 'constant/errCode'
import {
  JSON_COLON_MISS_MSG,
  JSON_KEY_NO_QUOTE_PREFIX_MSG,
  JSON_KEY_NUMBER_STR_MIX_MSG,
  JSON_VALUE_ILLEGAL_MSG
} from 'constant/errorMessage'
import { getValueEndIndexByType } from './util/valueProcessor'
import { getSectionType, hasChildNode } from './util/dataType'
import { getNextValidCharIndex } from './util'

/**
 * loop the JSON string from start index, find key name wrapped by quote pair
 * @param sourceStr json string file
 * @param startIndex check start index
 * @returns {key: string, endIndex: number}
 */
const getKeyNameNdIndex = (
  sourceStr: string,
  startIndex: number
): { key: string; endIndex: number } => {
  let checkingIndex = startIndex
  // cache char at last position for slash check
  let lastChar

  // record start index of first half quote
  let quoteStartIndex = -1

  for (; checkingIndex < sourceStr.length; checkingIndex++) {
    let char = sourceStr[checkingIndex]

    if (/\s/.test(char)) {
      continue
    }

    //  if the matched char is ", and match quote pair is empty, then the name is found and matched.
    if (char === '"' && lastChar !== '\\') {
      if (quoteStartIndex === -1) {
        quoteStartIndex = checkingIndex
      } else {
        return {
          key: sourceStr.substring(quoteStartIndex + 1, checkingIndex),
          endIndex: checkingIndex
        }
      }
    } else if (quoteStartIndex === -1) {
      // some non-quote character appears before quote
      throwErrorWithCode(
        JSON_KEY_NO_QUOTE_PREFIX,
        JSON_KEY_NO_QUOTE_PREFIX_MSG,
        checkingIndex.toString()
      )
    }

    // not appropriate when end of name match, but not matter
    lastChar = char
  }

  return {
    key: '',
    endIndex: -1
  }
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

  return getValueEndIndexByType(sourceStr, checkingIndex, sectionType!)
}

/**
 * read current level and form next level data
 * @param path reading file path
 * @param levelInfo current checking level info
 * @returns
 */
export const generateLevelDiffInfo = async (
  path: string,
  levelInfo?: JsonLevel
): Promise<JsonLevel[]> => {
  const { startIndex = 0, endIndex = undefined, type } = levelInfo || {}

  // if current node has no sub nodes
  if (levelInfo && !hasChildNode(levelInfo)) {
    return []
  }

  return readPartialFile({
    path,
    start: startIndex,
    end: endIndex
  }).then(levelStr => {
    // use array here to record json keys' order
    const levelArr: JsonLevel[] = []

    const levelType = type || getSectionType(levelStr[0])

    const { length: stringLength } = levelStr

    if (!levelType) {
      throwErrorWithCode(
        JSON_VALUE_ILLEGAL,
        JSON_VALUE_ILLEGAL_MSG,
        startIndex.toString()
      )
    }

    // last character is included at end index for current level

    // first character is only used for category check
    let checkingIndex = 1
    checkingIndex = getNextValidCharIndex(levelStr, checkingIndex)

    while (checkingIndex < stringLength) {
      const levelInfo: Partial<JsonLevel> = {}

      if ([DATA_TYPE.OBJECT].includes(levelType!)) {
        // check is level end and closed
        if (levelStr[checkingIndex] === '}') {
          break
        }
        const { endIndex: attributeNameEndIndex, key: levelAttributeName } =
          getKeyNameNdIndex(levelStr, checkingIndex)

        if (attributeNameEndIndex === -1) {
          // exist current match process
          throwErrorWithCode(
            JSON_KEY_NOT_CLOSE,
            JSON_KEY_NUMBER_STR_MIX_MSG,
            checkingIndex.toString()
          )
        }

        levelInfo.attributeName = levelAttributeName.trim()
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
        // end of current level
        if (levelStr[checkingIndex] === ']') {
          break
        }

        levelInfo.attributeName = `[${levelArr.length.toString()}]`
      } else {
        // string and number has no children
        // if file only has number/string
        return []
      }
      const levelEnd = getValueEndIndex(levelStr, checkingIndex)

      levelInfo.startIndex = checkingIndex + startIndex
      levelInfo.endIndex = levelEnd + startIndex
      levelInfo.type = getSectionType(levelStr[checkingIndex])
      levelArr.push(levelInfo as JsonLevel)

      checkingIndex = getNextValidCharIndex(levelStr, levelEnd + 1, ',')
    }

    return levelArr
  })
}
