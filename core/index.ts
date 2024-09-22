import {
  isValidPath,
  writeFileBasedIndex,
  writeStringIntoFile
} from 'util/file'
import { generateLevelDiffInfo } from './fileDiff'
import { compareDataInLevel } from './levelDiff'
import { NextLevelTask, SourceLevelDetail } from './type'
import { Buffer } from 'node:buffer'
import { WRITE_BUFFER_SIZE } from 'constant/file'
import { DIFF_RESULT } from 'model/diff'
import { JsonLevel } from 'model/dataProcess'

export const compareLevelWrite2File = async (
  referenceDetail: SourceLevelDetail,
  compareDetail: SourceLevelDetail,
  outputPath: string,
  jsonPath: string
) => {
  const { path: referenceSourcePath, levelInfo: referenceLevelInfo } =
    referenceDetail

  const { path: compareSourcePath, levelInfo: compareLevelInfo } = compareDetail

  const nextLevelStack: Array<NextLevelTask> = []

  // string waiting to be written to file
  let buffer = Buffer.alloc(WRITE_BUFFER_SIZE)
  buffer.write('{')

  while (referenceLevelInfo.length && compareLevelInfo.length) {
    const referenceTask = referenceLevelInfo.shift()

    const compareTask = compareLevelInfo.shift()

    // not catch errors to expose to caller
    const [referenceLevels, compareLevels] = await Promise.all([
      generateLevelDiffInfo(referenceSourcePath, referenceTask),
      generateLevelDiffInfo(compareSourcePath, compareTask)
    ])

    const levelResults = await compareDataInLevel(
      referenceLevels,
      compareLevels,
      referenceSourcePath,
      compareSourcePath
    )

    // loop the level info and write it into file
    for (let i = 0; i < levelResults.length; i++) {
      const levelResult = levelResults[i]
      const {
        type,
        attribute,
        refEndFileIndex,
        refStartFileIndex,
        prevIndex,
        changedIndex,
        compareEndFileIndex,
        compareStartFileIndex,
        isLeaf
      } = levelResult
      switch (type) {
        case DIFF_RESULT.MOVED_CHANGE:
          buffer.write(`"${jsonPath}.${attribute}":{"prevIndex": ${prevIndex}, 
"changedIndex": ${changedIndex}, "prevValue": `)
        case DIFF_RESULT.VALUE_CHANGE:
          buffer.write(`"${jsonPath}.${attribute}":{"prevValue": `)
          await writeStringIntoFile(outputPath, buffer.toString())
          await writeFileBasedIndex(
            outputPath,
            referenceSourcePath,
            refStartFileIndex!,
            refEndFileIndex!
          )
          await writeStringIntoFile(outputPath, `, "changedValue": "`)

          await writeFileBasedIndex(
            outputPath,
            referenceSourcePath,
            compareStartFileIndex!,
            compareEndFileIndex!
          )

          if (!isLeaf) {
            const refNode = referenceLevels.find(
              v => v.attributeName === attribute
            )
            const compareNode = compareLevels.find(
              v => v.attributeName === attribute
            )

            const nextLevelJsonPath = `${jsonPath}.${attribute}`

            refNode &&
              compareNode &&
              nextLevelStack.push({
                jsonPath: nextLevelJsonPath,
                nextCompare: compareNode,
                nextReference: refNode
              })
          }
          break
        case DIFF_RESULT.MOVED:
          buffer.write(
            `"${jsonPath}.${attribute}": {"prevIndex": ${prevIndex}, "changedIndex": ${changedIndex}}`
          )
          break
        case DIFF_RESULT.SAME:
          // nothing
          break
        case DIFF_RESULT.ADD:
        case DIFF_RESULT.REMOVED:
          let fromPath, startIndex, endIndex
          if (type === DIFF_RESULT.ADD) {
            fromPath = compareSourcePath
            startIndex = compareLevels[i].startIndex
            endIndex = compareLevels[i].endIndex
          } else {
            fromPath = referenceSourcePath
            startIndex = referenceLevels[i].startIndex
            endIndex = referenceLevels[i].endIndex
          }

          await writeFileBasedIndex(outputPath, fromPath, startIndex, endIndex)
          break
        default:
          break
      }
    }
    buffer.write('}')

    await writeStringIntoFile(outputPath, buffer.toString())
  }

  nextLevelStack.map(async task => {
    const { nextCompare, nextReference, jsonPath } = task

    const [nextRefTasks, nextCompareTasks] = await Promise.all([
      generateLevelDiffInfo(referenceSourcePath, nextReference),
      generateLevelDiffInfo(compareSourcePath, nextCompare)
    ])

    compareLevelWrite2File(
      {
        path: referenceSourcePath,
        levelInfo: nextRefTasks
      },
      {
        path: compareSourcePath,
        levelInfo: nextCompareTasks
      },
      outputPath,
      jsonPath
    )
  })
}

export const compareFileWrite2File = async (
  referencePath: string,
  comparePath: string,
  outputPath: string
) => {
  const [refFirstLevel, compareFirstLevel] = await Promise.all([
    generateLevelDiffInfo(referencePath),
    generateLevelDiffInfo(comparePath)
  ])

  compareLevelWrite2File(
    {
      path: referencePath,
      levelInfo: refFirstLevel
    },
    {
      path: comparePath,
      levelInfo: compareFirstLevel
    },
    outputPath,
    '$'
  )
}
