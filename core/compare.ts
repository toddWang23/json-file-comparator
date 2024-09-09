import { DiffLevel } from 'model/dataProcess'
import { readPartialFile } from 'util/file'
import { isValidSymbol } from './util/char'

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
}

export const generateLevelDiff = async (
  path: string,
  levelInfo: DiffLevel
): Promise<DiffLevel[]> => {
  const { startIndex, endIndex } = levelInfo

  return readPartialFile({
    path,
    start: startIndex,
    end: endIndex
  }).then(levelStr => {
    const levelDiffArr: DiffLevel[] = []

    let curLoopLevelInfo: Partial<DiffLevel> = {}
    // cache char at last position for slash check
    let lastChar

    // level name matched
    const isArrayType = levelStr[0] === '['

    let levelName = {
      matching: !isArrayType,
      name: ''
    }

    // let levelValueType =

    // rest not matched brace counter, act as stack
    let restMarkCounter = {
      brace: 0,
      square: 0,
      quote: 0
    }

    // get
    const attributeNameEndIndex = getStringEndIndex(levelStr, 0)

    for (let i = 1; i < levelStr.length; i++) {
      let char = levelStr[i]

      if (/\s/.test(char)) {
        continue
      }

      // everything between quote is ignored
      if (char === '"' && lastChar !== '\\') {
        restMarkCounter.quote = 1 - restMarkCounter.quote
      }

      // match the key part
      if (levelName.matching) {
        //  if the matched char is ", and match quote pair is empty, then the name is found and matched.
        if (char === '"' && lastChar !== '\\' && !restMarkCounter.quote) {
          levelName.matching = false

          // search the following colon and ignore it when matching value
          do {
            char = levelStr[++i]
          } while (/\s/.test(char) || char === ':')

          curLoopLevelInfo.attributeName = levelName.name
          curLoopLevelInfo.startIndex = i
        } else if (restMarkCounter.quote) {
          // if the quote is not closed, the char should be included into name.
          levelName.name += char
        } else if (char === '{' && lastChar !== '\\') {
          restMarkCounter.brace++
        } else {
          // TODO:
        }

        // not appropriate when end of name match, but not matter
        lastChar = char
        continue
      }

      // match the value part
      if (isValidSymbol(char, lastChar)) {
        switch (char) {
          case '[':
            restMarkCounter.square++
            break
          case ']':
            restMarkCounter.square--
            break
          case '{':
            restMarkCounter.brace++
            break
          case '}':
            restMarkCounter.brace--
            break
          case '"':
            restMarkCounter.quote = 1 - restMarkCounter.quote
        }
      }

      lastChar = char
    }

    return levelDiffArr
  })
}

export const compareBasedOnPath = (
  referencePath: string,
  comparedFilePath: string
) => {}
