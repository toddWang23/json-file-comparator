const JSON_SYMBOL = ['{', '}', '[', ']', '"']

/**
 * check the character is valid symbol, not escape one
 * @param char char to check
 * @param lastChar last index char
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
 * @returns first character that not match the pattern
 */
export const getNextValidCharIndex = (
  originStr: string,
  startIndex: number,
  allowChar?: string
) => {
  let checkingIndex = startIndex
  const searchPattern = new RegExp(`\\s${allowChar ? '|' + allowChar : ''}`)

  while (searchPattern.test(originStr[checkingIndex])) {
    checkingIndex++
  }
  return checkingIndex
}
