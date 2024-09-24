import { DATA_TYPE, JsonLevel } from 'model/dataProcess'

/**
 * based on current character return section type
 * @param char character need to be checked
 * @returns
 */
export const getSectionType = (char: string) => {
  switch (char) {
    case '{':
      return DATA_TYPE.OBJECT

    case '"':
      return DATA_TYPE.STRING

    case '[':
      return DATA_TYPE.ARRAY

    default:
      const asciiCode = char.charCodeAt(0)
      if (asciiCode <= 57 && asciiCode >= 48) {
        return DATA_TYPE.NUMBER
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
