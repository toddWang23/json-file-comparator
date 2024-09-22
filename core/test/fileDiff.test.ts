import path from 'path'
import { generateLevelDiffInfo } from '../fileDiff'

it('generateLevelDiffInfo: get object base level info', () => {
  const filePath = path.join(__dirname, './compareFile.json')
  return generateLevelDiffInfo(filePath)
    .then(data => {
      const [firstLevel, secondLevel, thirdLevel] = data

      expect(firstLevel.attributeName).toBe('cxv')
      expect(firstLevel.type).toBe('string')
      expect(firstLevel.startIndex).toBe(11)
      expect(firstLevel.endIndex).toBe(15)

      expect(secondLevel.attributeName).toBe('vvc')
      expect(secondLevel.type).toBe('string')
      expect(secondLevel.startIndex).toBe(27)
      expect(secondLevel.endIndex).toBe(31)

      expect(thirdLevel.attributeName).toBe('z')
      expect(thirdLevel.type).toBe('array')
      expect(thirdLevel.startIndex).toBe(41)
      expect(thirdLevel.endIndex).toBe(139)

      return generateLevelDiffInfo(filePath, thirdLevel)
    })
    .then(data => {
      expect(data.length).toBe(1)

      const [element] = data

      expect(element.attributeName).toBe('[0]')
      expect(element.type).toBe('array')
      expect(element.startIndex).toBe(47)
      expect(element.endIndex).toBe(135)

      return generateLevelDiffInfo(filePath, element)
    })
    .then(data => {
      expect(data.length).toBe(2)

      const [firstElement, secondElement] = data

      expect(firstElement.attributeName).toBe('[0]')
      expect(firstElement.type).toBe('array')
      expect(firstElement.startIndex).toBe(55)
      expect(firstElement.endIndex).toBe(69)

      expect(secondElement.attributeName).toBe('[1]')
      expect(secondElement.type).toBe('object')
      expect(secondElement.startIndex).toBe(78)
      expect(secondElement.endIndex).toBe(129)

      return Promise.all([
        generateLevelDiffInfo(filePath, firstElement),
        generateLevelDiffInfo(filePath, secondElement)
      ])
    })
    .then(dataArr => {
      const [[firstElement], [secondElement, thirdElement]] = dataArr

      expect(firstElement.attributeName).toBe('[0]')
      expect(firstElement.type).toBe('array')
      expect(firstElement.startIndex).toBe(56)
      expect(firstElement.endIndex).toBe(68)

      expect(secondElement.attributeName).toBe('asdas')
      expect(secondElement.type).toBe('string')
      expect(secondElement.startIndex).toBe(97)
      expect(secondElement.endIndex).toBe(103)

      expect(thirdElement.attributeName).toBe('a1')
      expect(thirdElement.type).toBe('number')
      expect(thirdElement.startIndex).toBe(120)
      expect(thirdElement.endIndex).toBe(121)

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
      expect(firstElement.startIndex).toBe(57)
      expect(firstElement.endIndex).toBe(59)

      expect(secondElement.attributeName).toBe('[1]')
      expect(secondElement.type).toBe('string')
      expect(secondElement.startIndex).toBe(62)
      expect(secondElement.endIndex).toBe(67)

      expect(Array.isArray(stringResult)).toBe(true)
      expect(stringResult.length).toBe(0)

      expect(Array.isArray(numberResult)).toBe(true)
      expect(numberResult.length).toBe(0)
    })
})
