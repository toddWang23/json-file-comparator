import { LEFT_BRACE, LEFT_BRACKET, QUOTE } from 'constant/char'
import { DATA_TYPE, JsonLevel } from 'model/dataProcess'

/**
 * based on current character return section type
 * @param char character need to be checked
 * @returns
 */
export const getSectionType = (char: string) => {
  switch (char) {
    case LEFT_BRACE:
      return DATA_TYPE.OBJECT

    case QUOTE:
      return DATA_TYPE.STRING

    case LEFT_BRACKET:
      return DATA_TYPE.ARRAY

    default:
      const asciiCode = char.charCodeAt(0)
      if (asciiCode <= 57 && asciiCode >= 48) {
        return DATA_TYPE.NUMBER
      } else {
        return DATA_TYPE.BOOL // not exact, should check in find value part
      }
  }
}

/**
 * whether current node has child nodes
 * @param node json node info
 * @returns
 */
export const hasChildNode = (node: JsonLevel): boolean =>
  [DATA_TYPE.ARRAY, DATA_TYPE.OBJECT].includes(node.type)
