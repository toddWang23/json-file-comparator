import { JsonLevel, DATA_TYPE } from 'model/dataProcess'
import { readPartialFile } from 'util/file'
import { throwErrorWithCode } from 'util/error'
import {
  JSON_COLON_MISS,
  JSON_KEY_NO_QUOTE_PREFIX,
  JSON_VALUE_ILLEGAL
} from 'constant/errCode'
import {
  JSON_COLON_MISS_MSG,
  JSON_KEY_NO_QUOTE_PREFIX_MSG,
  JSON_VALUE_ILLEGAL_MSG
} from 'constant/errorMessage'
import { getValueEndIndexByType } from './util/valueProcessor'
import { getSectionType, hasChildNode } from './util/dataType'
import { getNextValidCharIndex } from './util'
import { LevelAccumulation, SearchStage, SymbolElement } from './type'
import { QUOTE, RIGHT_BRACE, RIGHT_BRACKET } from 'constant/char'

/**
 * loop the JSON string from start index, find key name wrapped by quote pair
 * @param sourceStr json string file
 * @param startIndex check start index
 * @returns {key: string, endIndex: number}
 */
const getKeyNameNdIndex = (
  sourceStr: string,
  startIndex: number,
  symbolStack: SymbolElement[]
): { key: string; endIndex: number } => {
  let checkingIndex = startIndex
  // cache char at last position for slash check
  let lastChar

  // record start index of first half quote
  let quoteStartIndex = -1

  if (symbolStack?.length) {
    symbolStack.pop()
    quoteStartIndex = 0
  }

  for (; checkingIndex < sourceStr.length; checkingIndex++) {
    let char = sourceStr[checkingIndex]

    if (/\s/.test(char)) {
      continue
    }

    //  if the matched char is ", and match quote pair is empty, then the name is found and matched.
    if (char === QUOTE && lastChar !== '\\') {
      // start index not matched
      if (quoteStartIndex === -1) {
        quoteStartIndex = checkingIndex + 1
      } else {
        return {
          key: sourceStr.substring(quoteStartIndex, checkingIndex),
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
    key: quoteStartIndex > -1 ? sourceStr.substring(quoteStartIndex) : '', // end quote's index is not found, return what is matched.
    endIndex: quoteStartIndex > -1 ? NaN : -1
  }
}

const levelInfoProcessor = (
  chunk: string,
  accumulation: LevelAccumulation
): LevelAccumulation => {
  const nextAccumulation = accumulation || ({} as LevelAccumulation)
  const { length: stringLength } = chunk
  let checkingIndex = 0

  // first chunk
  if (!accumulation.parentType) {
    // ignore other empty char
    checkingIndex = getNextValidCharIndex(chunk, checkingIndex)

    if (isNaN(checkingIndex)) {
      // come to the end, continue to next chunk
      return {
        levels: []
      }
    }

    const levelType = getSectionType(chunk[checkingIndex])
    if (!levelType) {
      throwErrorWithCode(
        JSON_VALUE_ILLEGAL,
        JSON_VALUE_ILLEGAL_MSG,
        String(accumulation.throughSize || 0)
      )
    }
    // nextAccumulation.leftSymbolStack = []
    // nextAccumulation.levels = []
    nextAccumulation.parentType = levelType
    // nextAccumulation.throughSize = 0
    checkingIndex++
  }

  if (!nextAccumulation.remainLevelInfo) {
    nextAccumulation.remainLevelInfo = {
      stage: SearchStage.key
    }
  }

  let levelInfo = nextAccumulation.remainLevelInfo
  delete nextAccumulation.remainLevelInfo

  // complete left node info from last level
  while (checkingIndex < stringLength) {
    const { stage = 0 } = levelInfo

    if (
      stage <= SearchStage.key &&
      accumulation.parentType === DATA_TYPE.OBJECT
    ) {
      // allow last level's splitter - comma
      checkingIndex = getNextValidCharIndex(chunk, checkingIndex, ',', false)

      // here is end of object
      if (chunk[checkingIndex] === RIGHT_BRACE) {
        break
      }

      const { endIndex: attributeNameEndIndex, key: levelAttributeName } =
        getKeyNameNdIndex(
          chunk,
          checkingIndex,
          nextAccumulation?.leftSymbolStack || []
        )

      const contactedAttribute =
        (levelInfo.attributeName || '') + levelAttributeName.trim()

      // come to end but not finish key search
      if (isNaN(attributeNameEndIndex) || attributeNameEndIndex === -1) {
        nextAccumulation.remainLevelInfo = {
          attributeName: contactedAttribute,
          stage: SearchStage.key
        }
        nextAccumulation.leftSymbolStack =
          attributeNameEndIndex === -1
            ? []
            : [
                {
                  symbol: QUOTE,
                  index: checkingIndex
                }
              ]
        break
      }

      levelInfo.attributeName = contactedAttribute
      checkingIndex = attributeNameEndIndex + 1
    } else if (
      stage <= SearchStage.key &&
      accumulation.parentType === DATA_TYPE.ARRAY
    ) {
      checkingIndex = getNextValidCharIndex(chunk, checkingIndex)
      // here is end of array
      if (chunk[checkingIndex] === RIGHT_BRACKET) {
        break
      }

      levelInfo.attributeName = `[${nextAccumulation.levels.length.toString()}]`
    }

    if (
      stage <= SearchStage.colon &&
      accumulation.parentType === DATA_TYPE.OBJECT
    ) {
      // find colon index in string
      const colonSpaceEndIndex = getNextValidCharIndex(
        chunk,
        checkingIndex,
        ':',
        true
      )

      // other non-empty char is found instead of colon
      if (colonSpaceEndIndex === -1) {
        throwErrorWithCode(
          JSON_COLON_MISS,
          JSON_COLON_MISS_MSG,
          checkingIndex.toString()
        )
      }

      if (isNaN(colonSpaceEndIndex)) {
        nextAccumulation.remainLevelInfo = {
          ...levelInfo,
          stage: SearchStage.colon
        }
        break
      }

      checkingIndex = colonSpaceEndIndex
    }

    if (stage <= SearchStage.type) {
      // need to check here bcz it's might directly executed from chunk start
      checkingIndex = getNextValidCharIndex(chunk, checkingIndex)

      // reached the end file but no value found
      if (checkingIndex === stringLength) {
        nextAccumulation.remainLevelInfo = {
          ...levelInfo,
          stage: SearchStage.type
        }

        break
      }

      levelInfo.type = getSectionType(chunk[checkingIndex]) // not move index for value symbol pair
    }

    if (stage <= SearchStage.value) {
      // skip empty char
      checkingIndex = getNextValidCharIndex(chunk, checkingIndex)

      const { endIndex: levelEnd, symbolStack } = getValueEndIndexByType(
        chunk,
        checkingIndex,
        levelInfo.type!,
        nextAccumulation.leftSymbolStack || [],
        accumulation.throughSize || 0
      )

      const { throughSize = 0 } = nextAccumulation
      if (levelInfo?.startIndex === undefined) {
        levelInfo.startIndex = checkingIndex + throughSize
      }

      // if not fully matched, jump to next stream processor
      if (isNaN(levelEnd)) {
        nextAccumulation.remainLevelInfo = {
          ...levelInfo,
          stage: SearchStage.value
        }
        nextAccumulation.leftSymbolStack = symbolStack

        break
      }
      levelInfo.endIndex = levelEnd + throughSize

      delete levelInfo.stage

      nextAccumulation.levels.push(levelInfo as JsonLevel)

      levelInfo = {
        stage: SearchStage.key
      }
      checkingIndex = getNextValidCharIndex(chunk, levelEnd + 1, ',')
    }
  }
  nextAccumulation.throughSize =
    (nextAccumulation.throughSize || 0) + stringLength

  return nextAccumulation
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

  return readPartialFile(
    {
      path,
      start: startIndex,
      end: endIndex
    },
    levelInfoProcessor,
    {
      // parentType: type,
      levels: [],
      throughSize: startIndex,
      leftSymbolStack: []
    }
  ).then(result => {
    const { levels } = result

    return levels
  })
}
