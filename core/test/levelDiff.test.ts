import { generateLevelDiffInfo } from 'core/diffInfo'
import { compareDataInLevel } from 'core/diffCompare'
import { DIFF_RESULT } from 'model/diff'
import path from 'path'

it('compareDataInLevel: compare two file at same level', () => {
  const compareFilePath = path.join(__dirname, './compareFile.json')
  const referenceFilePath = path.join(__dirname, './referenceFile.json')

  return Promise.all([
    generateLevelDiffInfo(referenceFilePath),
    generateLevelDiffInfo(compareFilePath)
  ])
    .then(diffDetailResult => {
      const [referenceFileDiffInfo, compareFileDiffInfo] = diffDetailResult

      return compareDataInLevel(
        referenceFileDiffInfo,
        compareFileDiffInfo,
        referenceFilePath,
        compareFilePath
      )
    })
    .then(data => {
      const arr0 = data.find(v => v.attribute === '[0]')

      expect(arr0?.type).toBe(DIFF_RESULT.REMOVED)

      const arr1 = data.find(v => v.attribute === '[1]')

      expect(arr1?.type).toBe(DIFF_RESULT.REMOVED)

      const arr2 = data.find(v => v.attribute === '[1]')

      expect(arr2?.type).toBe(DIFF_RESULT.REMOVED)

      const cxv = data.find(v => v.attribute === 'cxv')

      expect(cxv?.type).toBe(DIFF_RESULT.ADD)

      const vvc = data.find(v => v.attribute === 'vvc')

      expect(vvc?.type).toBe(DIFF_RESULT.ADD)

      const z = data.find(v => v.attribute === 'z')

      expect(z?.type).toBe(DIFF_RESULT.ADD)
    })
})

it('compareDataInLevel: compare two file with slight difference', () => {
  const compareFilePath = path.join(__dirname, './referenceDiffFile.json')
  const referenceFilePath = path.join(__dirname, './referenceFile.json')

  return Promise.all([
    generateLevelDiffInfo(referenceFilePath),
    generateLevelDiffInfo(compareFilePath)
  ])
    .then(diffDetailResult => {
      const [referenceFileDiffInfo, compareFileDiffInfo] = diffDetailResult

      return compareDataInLevel(
        referenceFileDiffInfo,
        compareFileDiffInfo,
        referenceFilePath,
        compareFilePath
      )
    })
    .then(data => {
      const arr0 = data.find(v => v.attribute === '[0]')

      expect(arr0?.isLeaf).toBe(false)

      const arr1 = data.find(v => v.attribute === '[1]')

      expect(arr1?.type).toBe(DIFF_RESULT.VALUE_CHANGE)

      const arr2 = data.find(v => v.attribute === '[2]')

      expect(arr2?.isLeaf).toBe(false)

      const arr3 = data.find(v => v.attribute === '[3]')

      expect(arr3?.type).toBe(DIFF_RESULT.ADD)
    })
})
