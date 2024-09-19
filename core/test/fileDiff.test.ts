import path from 'path'
import { generateLevelDiff } from '../fileDiff'

it('generateLevelDiff: get object base level info', () => {
  const filePath = path.join(__dirname, './compareFile.json')
  return generateLevelDiff(filePath)
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

      return generateLevelDiff(filePath, thirdLevel)
    })
    .then(data => {
      expect(data.length).toBe(1)

      const [element] = data

      expect(element.attributeName).toBe('[0]')
      expect(element.type).toBe('array')
      expect(element.startIndex).toBe(27)
      expect(element.endIndex).toBe(31)
    })
})
