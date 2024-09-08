import { DiffLevel } from 'model/dataProcess'
import { readPartialFile } from 'util/file'

export const generateLevelDiff = (
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

    let curLoopLevelInfo = {}
    // cache char at last position for slash check
    let lastChar

    // level name matched
    const isArrayType = levelStr[0] === '['

    let levelName = {
      matching: !isArrayType,
      name: ''
    }

    // rest not matched brace counter, act as stack
    let restMarkCounter = {
      brace: 0,
      square: 0,
      quote: 0
    }

    for (let i = 1; i < levelStr.length; i++) {
      const char = levelStr[i]

      if (/\s/.test(char)) {
        continue
      }

      if (char === '"' && lastChar !== '\\') {
        restMarkCounter.quote = 1 - restMarkCounter.quote
      }

      // match the key part
      if (levelName.matching) {
        if (char === '"' && lastChar !== '\\' && !restMarkCounter.quote) {
          levelName.matching = false
        }

        if (restMarkCounter.quote) {
          levelName.name += char
        } else if (char === '{' && lastChar !== '\\') {
          restMarkCounter.brace++
        } else {
          // TODO:
        }
        continue
      }

      // match the value part
      if (char === '[' && lastChar !== '\\') {
        restMarkCounter.square++
      } else if (char === ']' && lastChar !== '\\') {
        restMarkCounter.square--
      } else if (char === '{' && lastChar !== '\\') {
        restMarkCounter.brace++
      } else if (char === '}' && lastChar !== '\\') {
        restMarkCounter.brace--
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
