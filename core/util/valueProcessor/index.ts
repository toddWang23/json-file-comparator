import { JSON_VALUE_EXTRA_SYMBOL } from 'constant/errCode'
import { JSON_VALUE_EXTRA_MSG } from 'constant/errorMessage'
import { DATA_TYPE } from 'model/dataProcess'
import { throwErrorWithCode } from 'util/error'
import { isValidSymbol } from '../char'

/**
 * search level end comma and empty string from `startIndex`
 * @param sourceStr search string
 * @param startIndex search start index
 */
export const getValueEndIndex = (sourceStr: string, startIndex: number) => {
  let iterateIndex = startIndex
  const { length } = sourceStr

  while (iterateIndex < length && /\s|,/.test(sourceStr[iterateIndex])) {
    iterateIndex++
  }

  return iterateIndex - 1
}

/**
 * search number end index start from `startIndex`
 * @param sourceStr search string
 * @param startIndex search start index
 */
export const getNumberValueEndIndex = (
  sourceStr: string,
  startIndex: number
) => {
  let iterateIndex = startIndex
  const { length } = sourceStr

  // match all the number and blank character
  while (
    iterateIndex < length &&
    !/\s/.test(sourceStr[iterateIndex]) &&
    !isNaN(Number(sourceStr[iterateIndex]))
  ) {
    iterateIndex++
  }

  return iterateIndex - 1
}

/**
 * search string end index start from `startIndex`
 * @param sourceStr search string
 * @param startIndex search start index
 *
 */
export const getValueEndIndexByType = (
  sourceStr: string,
  startIndex: number,
  levelType: DATA_TYPE
) => {
  if (levelType === DATA_TYPE.NUMBER) {
    return getNumberValueEndIndex(sourceStr, startIndex)
  }

  // number type value should not shift, so do it after type evaluation
  let iterateIndex = startIndex + 1
  const { length } = sourceStr

  // rest not matched brace counter, act as stack
  const restMarkCounter = {
    [DATA_TYPE.ARRAY]: 0,
    [DATA_TYPE.OBJECT]: 0,
    [DATA_TYPE.STRING]: 0
  }

  restMarkCounter[levelType]++

  let lastChar
  // match all the string and blank character
  while (iterateIndex < length) {
    const curChar = sourceStr[iterateIndex]

    if (isValidSymbol(sourceStr[iterateIndex], lastChar, '"')) {
      restMarkCounter[DATA_TYPE.STRING] = 1 - restMarkCounter[DATA_TYPE.STRING]
      // if symbols are between quotes, they are all omitted.
    } else if (restMarkCounter[DATA_TYPE.STRING] === 0) {
      if (isValidSymbol(sourceStr[iterateIndex], lastChar, '{')) {
        restMarkCounter[DATA_TYPE.OBJECT]++
      } else if (isValidSymbol(sourceStr[iterateIndex], lastChar, '}')) {
        restMarkCounter[DATA_TYPE.OBJECT]--
      } else if (isValidSymbol(sourceStr[iterateIndex], lastChar, '[')) {
        restMarkCounter[DATA_TYPE.ARRAY]++
      } else if (isValidSymbol(sourceStr[iterateIndex], lastChar, ']')) {
        restMarkCounter[DATA_TYPE.ARRAY]--
      }
    }

    if (
      restMarkCounter[DATA_TYPE.ARRAY] < 0 ||
      restMarkCounter[DATA_TYPE.OBJECT] < 0 ||
      restMarkCounter[DATA_TYPE.ARRAY] < 0
    ) {
      throwErrorWithCode(
        JSON_VALUE_EXTRA_SYMBOL,
        JSON_VALUE_EXTRA_MSG,
        iterateIndex.toString()
      )
    }

    if (
      restMarkCounter[DATA_TYPE.ARRAY] === 0 &&
      restMarkCounter[DATA_TYPE.OBJECT] === 0 &&
      restMarkCounter[DATA_TYPE.STRING] === 0
    ) {
      // return iterateIndex
      break
    }

    lastChar = curChar
    iterateIndex++
  }

  // end of the file
  if (length - 1 === iterateIndex) {
    return iterateIndex
  }

  // return getValueEndIndex(sourceStr, iterateIndex + 1)
  return iterateIndex
}
