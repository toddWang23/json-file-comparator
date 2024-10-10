import {
  LEFT_BRACE,
  LEFT_BRACKET,
  QUOTE,
  RIGHT_BRACE,
  RIGHT_BRACKET
} from 'constant/char'

const JSON_SYMBOL = [
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  QUOTE
]

/**
 * check the character is valid symbol, not escape character
 * @param char char to check
 * @param lastChar last index char
 * @param compareChar a certain char which is valid when it's matched.
 * @returns
 */
export const isValidSymbol = (
  char: string,
  lastChar?: string,
  compareChar?: string
) => {
  if (lastChar === '\\') {
    return false
  }

  return compareChar ? char === compareChar : JSON_SYMBOL.includes(char)
}

/**
 * get the first not blank character and not in the passed in `allowChar`, return first matched character
 * @param originStr searching string
 * @param startIndex start searching index
 * @param allowChar extra allow char when searching
 * @param isAllowCharRequired `allowChar` is required during searching. if true and `allowChar` is not found, will return -1
 * @returns first character that not match the pattern
 */
export const getNextValidCharIndex = (
  originStr: string,
  startIndex: number,
  allowChar?: string,
  isAllowCharRequired?: boolean
) => {
  let checkingIndex = startIndex
  const { length } = originStr

  const searchPattern = new RegExp(`\\s${allowChar ? '|' + allowChar : ''}`)

  let foundAllowChar = !isAllowCharRequired

  while (
    checkingIndex < length &&
    searchPattern.test(originStr[checkingIndex])
  ) {
    // found allowChar
    if (!foundAllowChar && originStr[checkingIndex] === allowChar) {
      foundAllowChar = true
    }

    checkingIndex++
  }

  if (foundAllowChar) {
    return checkingIndex
  } else {
    return checkingIndex === length
      ? NaN // reached the last char of string but allowChar is not found in string
      : -1 // allowChar is met before non-empty char
  }
}
