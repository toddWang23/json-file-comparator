import { generateLevelDiffInfo } from 'core/fileDiff'
import { compareDataInLevel } from 'core/levelDiff'
import path from 'path'

it('compareDataInLevel: compare two file at same level', () => {
  const compareFilePath = path.join(__dirname, './compareFile.json')
  const referenceFilePath = path.join(__dirname, './referenceFile.json')

  return Promise.all([
    generateLevelDiffInfo(referenceFilePath),
    generateLevelDiffInfo(compareFilePath)
  ]).then(diffDetailResult => {
    const [referenceFileDiffInfo, compareFileDiffInfo] = diffDetailResult

    compareDataInLevel(
      referenceFileDiffInfo,
      compareFileDiffInfo,
      referenceFilePath,
      compareFilePath
    ).then(data => {
      const a = JSON.stringify(data)
      expect(a).toBe('{}')
    })
  })
})
