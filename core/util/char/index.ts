const JSON_SYMBOL = ['{', '}', '[', ']', '"']

/**
 * check the character is valid symbol, not escape one
 * @param char char to check
 * @param lastChar last index char
 * @returns
 */
export const isValidSymbol = (char: string, lastChar?: string) =>
  lastChar !== '\\' && JSON_SYMBOL.includes(char)
