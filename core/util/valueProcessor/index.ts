import { JSON_VALUE_EXTRA_SYMBOL } from 'constant/errCode'
import { JSON_VALUE_EXTRA_MSG } from 'constant/errorMessage'
import { DATA_TYPE } from 'model/dataProcess'
import { throwErrorWithCode } from 'util/error'
import { isValidSymbol } from '../char'
// import { SymbolElement } from 'core/type'
import {
  FALSE,
  LEFT_BRACE,
  LEFT_BRACKET,
  QUOTE,
  RIGHT_BRACE,
  RIGHT_BRACKET,
  SLASH,
  TRUE
} from 'constant/char'
import { ValueEndResult } from './type'
import { SymbolElement } from 'core/type'

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
  startIndex: number,
  symbolStack: SymbolElement[],
  chunkStartSize: number
): ValueEndResult => {
  let iterateIndex = startIndex
  const { length } = sourceStr

  const lastSymbol = symbolStack.pop()

  const isNumberLast = lastSymbol?.symbol === 0

  // stack top is not number's start, put it back
  if (!isNumberLast && lastSymbol) {
    symbolStack.push(lastSymbol)
  }

  // match all the number and blank character
  // TODO: validate number format
  while (
    iterateIndex < length &&
    !/\s|\./.test(sourceStr[iterateIndex]) &&
    !isNaN(Number(sourceStr[iterateIndex]))
  ) {
    iterateIndex++
  }

  // reached the last index but not finish number search
  if (iterateIndex === length) {
    if (isNumberLast) {
      symbolStack.push(lastSymbol)
    } else {
      symbolStack.push({
        index: startIndex + chunkStartSize,
        symbol: 0 // put 0 mark as number
      })
    }
  }

  return {
    endIndex: iterateIndex === length ? NaN : iterateIndex - 1,
    symbolStack: symbolStack
  }
}

/**
 * search boolean end index start from `startIndex`
 * @param sourceStr search string
 * @param startIndex search start index
 */
export const getBooleanValueEndIndex = (
  sourceStr: string,
  startIndex: number,
  symbolStack: SymbolElement[],
  chunkStartSize: number
): ValueEndResult => {
  let iterateIndex = startIndex
  const { length } = sourceStr

  let matchedStr = ''

  const lastSymbol = symbolStack.pop()

  const isBooleanLast = lastSymbol?.symbol === true

  if (!isBooleanLast && lastSymbol) {
    symbolStack.push(lastSymbol)
  }

  // match all the number and blank character
  do {
    matchedStr += sourceStr[iterateIndex]

    // matched boolean value
    if (TRUE === matchedStr || FALSE === matchedStr) {
      return {
        endIndex: iterateIndex,
        symbolStack
      }
    }

    if (!TRUE.startsWith(matchedStr) && !FALSE.startsWith(matchedStr)) {
      // not boolean value
      return {
        endIndex: -1,
        symbolStack
      }
    }

    iterateIndex++
  } while (iterateIndex < length)

  // end chunk but not fully matched
  symbolStack.push({
    index: startIndex + chunkStartSize,
    symbol: true
  })

  return {
    endIndex: NaN,
    symbolStack
  }
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
  levelType: DATA_TYPE,
  symbolStack: SymbolElement[],
  chunkStartSize: number
): ValueEndResult => {
  if (levelType === DATA_TYPE.NUMBER) {
    return getNumberValueEndIndex(
      sourceStr,
      startIndex,
      symbolStack,
      chunkStartSize
    )
  }

  if (levelType === DATA_TYPE.BOOL) {
    return getBooleanValueEndIndex(
      sourceStr,
      startIndex,
      symbolStack,
      chunkStartSize
    )
  }

  // number type value should not shift, so do it after type evaluation
  let iterateIndex = startIndex
  const { length } = sourceStr

  let lastChar

  let lastSymbol = symbolStack[symbolStack.length - 1]
  if (
    lastSymbol?.symbol === SLASH &&
    lastSymbol?.index === chunkStartSize + iterateIndex - 1
  ) {
    // if slash is right before current chunk's symbol
    lastChar = SLASH
    symbolStack.pop()
  }

  // match all the string and blank character
  while (iterateIndex < length) {
    const curChar = sourceStr[iterateIndex]
    lastSymbol = symbolStack[symbolStack.length - 1]

    if (isValidSymbol(sourceStr[iterateIndex], lastChar, QUOTE)) {
      if (lastSymbol?.symbol === QUOTE) {
        symbolStack.pop()
      } else {
        symbolStack.push({
          symbol: QUOTE,
          index: iterateIndex + chunkStartSize
        })
      }
      // if symbols are between quotes, they are all omitted.
    } else if (lastSymbol?.symbol !== QUOTE) {
      if (isValidSymbol(sourceStr[iterateIndex], lastChar, LEFT_BRACE)) {
        symbolStack.push({
          symbol: LEFT_BRACE,
          index: chunkStartSize + iterateIndex
        })
      } else if (
        isValidSymbol(sourceStr[iterateIndex], lastChar, RIGHT_BRACE)
      ) {
        if (lastSymbol?.symbol === LEFT_BRACE) {
          symbolStack.pop()
        } else {
          // no start symbol
          throwErrorWithCode(
            JSON_VALUE_EXTRA_SYMBOL,
            JSON_VALUE_EXTRA_MSG,
            iterateIndex.toString()
          )
        }
      } else if (
        isValidSymbol(sourceStr[iterateIndex], lastChar, LEFT_BRACKET)
      ) {
        symbolStack.push({
          symbol: LEFT_BRACKET,
          index: chunkStartSize + iterateIndex
        })
      } else if (
        isValidSymbol(sourceStr[iterateIndex], lastChar, RIGHT_BRACKET)
      ) {
        if (lastSymbol?.symbol === LEFT_BRACKET) {
          symbolStack.pop()
        } else {
          // no start symbol
          throwErrorWithCode(
            JSON_VALUE_EXTRA_SYMBOL,
            JSON_VALUE_EXTRA_MSG,
            iterateIndex.toString()
          )
        }
      }
    }

    // stack is empty, then it's all matched, it's value's end
    if (symbolStack.length === 0) {
      break
    }

    lastChar = curChar
    iterateIndex++
  }

  // end of the file, need to check
  if (length === iterateIndex) {
    // last character is slash, need to push to stack to avoid mistake any symbol
    if (lastChar === SLASH) {
      symbolStack.push({
        index: length - 1,
        symbol: SLASH
      })
    }
    return {
      endIndex: NaN,
      symbolStack
    }
  }

  // it's all matched, then empty the symbol stack
  return {
    endIndex: iterateIndex,
    symbolStack: []
  }
}
