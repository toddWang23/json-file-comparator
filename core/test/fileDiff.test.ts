import path from 'path'
import { generateLevelDiffInfo } from '../diffInfo'

it('generateLevelDiffInfo: get object base level info', () => {
  const filePath = path.join(__dirname, './compareFile.json')
  return generateLevelDiffInfo(filePath)
    .then(data => {
      const [firstLevel, secondLevel, thirdLevel, firthLevel] = data

      expect(firstLevel.attributeName).toBe('cxv')
      expect(firstLevel.type).toBe('string')
      // expect(firstLevel.endIndex - firstLevel.startIndex).toBe(4)

      expect(secondLevel.attributeName).toBe('vvc')
      expect(secondLevel.type).toBe('string')
      // expect(secondLevel.endIndex - secondLevel.startIndex).toBe(4)

      expect(thirdLevel.attributeName).toBe('z')
      expect(thirdLevel.type).toBe('array')
      // expect(thirdLevel.endIndex - thirdLevel.startIndex).toBe(98)

      expect(firthLevel.attributeName).toBe('boolean')
      expect(firthLevel.type).toBe('boolean')

      return generateLevelDiffInfo(filePath, thirdLevel)
    })
    .then(data => {
      expect(data.length).toBe(1)

      const [element] = data

      expect(element.attributeName).toBe('[0]')
      expect(element.type).toBe('array')
      // expect(element.endIndex - element.startIndex).toBe(88)

      return generateLevelDiffInfo(filePath, element)
    })
    .then(data => {
      expect(data.length).toBe(2)

      const [firstElement, secondElement] = data

      expect(firstElement.attributeName).toBe('[0]')
      expect(firstElement.type).toBe('array')
      // expect(firstElement.endIndex - firstElement.startIndex).toBe(14)

      expect(secondElement.attributeName).toBe('[1]')
      expect(secondElement.type).toBe('object')
      // expect(secondElement.endIndex - secondElement.startIndex).toBe(51)

      return Promise.all([
        generateLevelDiffInfo(filePath, firstElement),
        generateLevelDiffInfo(filePath, secondElement)
      ])
    })
    .then(dataArr => {
      const [[firstElement, booleanElement], [secondElement, thirdElement]] =
        dataArr

      expect(firstElement.attributeName).toBe('[0]')
      expect(firstElement.type).toBe('array')
      // expect(firstElement.endIndex - firstElement.startIndex).toBe(12)

      expect(booleanElement.attributeName).toBe('[1]')
      expect(booleanElement.type).toBe('boolean')

      expect(secondElement.attributeName).toBe('asdas')
      expect(secondElement.type).toBe('string')
      // expect(secondElement.endIndex - secondElement.startIndex).toBe(6)

      expect(thirdElement.attributeName).toBe('a1')
      expect(thirdElement.type).toBe('number')
      // expect(thirdElement.endIndex - thirdElement.startIndex).toBe(1)

      return Promise.all([
        generateLevelDiffInfo(filePath, firstElement),
        generateLevelDiffInfo(filePath, secondElement),
        generateLevelDiffInfo(filePath, thirdElement)
      ])
    })
    .then(dataArr => {
      const [[firstElement, secondElement], stringResult, numberResult] =
        dataArr

      expect(firstElement.attributeName).toBe('[0]')
      expect(firstElement.type).toBe('number')
      // expect(firstElement.endIndex - firstElement.startIndex).toBe(2)

      expect(secondElement.attributeName).toBe('[1]')
      expect(secondElement.type).toBe('string')
      // expect(secondElement.endIndex - secondElement.startIndex).toBe(5)

      expect(Array.isArray(stringResult)).toBe(true)
      expect(stringResult.length).toBe(0)

      expect(Array.isArray(numberResult)).toBe(true)
      expect(numberResult.length).toBe(0)
    })
})
