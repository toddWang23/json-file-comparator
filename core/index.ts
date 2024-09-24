import { writeFileBasedIndex, writeStringIntoFile } from 'util/file'
import { generateLevelDiffInfo } from './fileDiff'
import { compareDataInLevel } from './levelDiff'
import { SourceLevelDetail } from './type'
import { DIFF_RESULT } from 'model/diff'

export const compareLevelWrite2File = async (
  referenceDetail: SourceLevelDetail,
  compareDetail: SourceLevelDetail,
  outputPath: string,
  jsonPath: string
) => {
  const { path: referenceSourcePath, levelInfo: referenceTask } =
    referenceDetail

  const { path: compareSourcePath, levelInfo: compareTask } = compareDetail

  // string waiting to be written to file
  let buffer: string[] = []

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

  const { length } = levelResults

  // loop the level info and write it into file
  for (let i = 0; i < length; i++) {
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
        buffer.push(`"${jsonPath}.${attribute}":{"type": "move_change", "prevIndex": ${prevIndex}, 
"changedIndex": ${changedIndex}, "prevValue": `)

        await writeStringIntoFile(outputPath, buffer.join(''))
        buffer = []
        await writeFileBasedIndex(
          outputPath,
          referenceSourcePath,
          refStartFileIndex!,
          refEndFileIndex!
        )
        await writeStringIntoFile(outputPath, `, "changedValue": "`)
        buffer = []
        await writeFileBasedIndex(
          outputPath,
          referenceSourcePath,
          compareStartFileIndex!,
          compareEndFileIndex!
        )

        // compare deeper nodes
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
            (await compareLevelWrite2File(
              {
                path: referenceSourcePath,
                levelInfo: refNode
              },
              {
                path: compareSourcePath,
                levelInfo: compareNode
              },
              outputPath,
              nextLevelJsonPath
            ))
        }
        // buffer.push('},')
        await writeStringIntoFile(outputPath, `}${i !== length - 1 ? ',' : ''}`)
        break

      case DIFF_RESULT.VALUE_CHANGE:
        buffer.push(
          `"${jsonPath}.${attribute}":{"type": "value_change", "prevValue": `
        )
        await writeStringIntoFile(outputPath, buffer.join(''))
        buffer = []
        await writeFileBasedIndex(
          outputPath,
          referenceSourcePath,
          refStartFileIndex!,
          refEndFileIndex!
        )
        await writeStringIntoFile(outputPath, `, "changedValue": `)

        await writeFileBasedIndex(
          outputPath,
          compareSourcePath,
          compareStartFileIndex!,
          compareEndFileIndex!
        )

        // compare deeper nodes
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
            (await compareLevelWrite2File(
              {
                path: referenceSourcePath,
                levelInfo: refNode
              },
              {
                path: compareSourcePath,
                levelInfo: compareNode
              },
              outputPath,
              nextLevelJsonPath
            ))
        }
        // buffer.push('},')
        await writeStringIntoFile(outputPath, `}${i !== length - 1 ? ',' : ''}`)
        break
      case DIFF_RESULT.MOVED:
        // buffer.push(
        //   `"${jsonPath}.${attribute}": {"type": "move", "prevIndex": ${prevIndex}, "changedIndex": ${changedIndex}},`
        // )
        await writeStringIntoFile(
          outputPath,
          `"${jsonPath}.${attribute}": {"type": "move", "prevIndex": ${prevIndex}, "changedIndex": ${changedIndex}}${i !== length - 1 ? ',' : ''}`
        )

        break
      case DIFF_RESULT.SAME:
        break
      case DIFF_RESULT.UNDEFINED:
        const refNode = referenceLevels.find(v => v.attributeName === attribute)
        const compareNode = compareLevels.find(
          v => v.attributeName === attribute
        )

        const nextLevelJsonPath = `${jsonPath}.${attribute}`

        refNode &&
          compareNode &&
          (await compareLevelWrite2File(
            {
              path: referenceSourcePath,
              levelInfo: refNode
            },
            {
              path: compareSourcePath,
              levelInfo: compareNode
            },
            outputPath,
            nextLevelJsonPath
          ))
        break
      case DIFF_RESULT.ADD:
        const fromPathAdd = compareSourcePath
        const startIndexAdd = compareLevels[i].startIndex
        const endIndexAdd = compareLevels[i].endIndex
        buffer.push(`"${jsonPath}.${attribute}": {"type": "add", "content": `)
        await writeStringIntoFile(outputPath, buffer.join(''))
        buffer = []
        await writeFileBasedIndex(
          outputPath,
          fromPathAdd,
          startIndexAdd,
          endIndexAdd
        )

        await writeStringIntoFile(outputPath, `}${i !== length - 1 ? ',' : ''}`)
        break
      case DIFF_RESULT.REMOVED:
        const fromPathRemoved = referenceSourcePath
        const startIndexRemoved = referenceLevels[i].startIndex
        const endIndexRemoved = referenceLevels[i].endIndex
        buffer.push(
          `"${jsonPath}.${attribute}": {"type": "removed", "content": `
        )
        await writeStringIntoFile(outputPath, buffer.join(''))
        buffer = []
        await writeFileBasedIndex(
          outputPath,
          fromPathRemoved,
          startIndexRemoved,
          endIndexRemoved
        )

        await writeStringIntoFile(outputPath, `}${i !== length - 1 ? ',' : ''}`)

        break
      default:
        break
    }
  }

  await writeStringIntoFile(outputPath, buffer.join(''))
}

export const compareFileWrite2File = async (
  referencePath: string,
  comparePath: string,
  outputPath: string
) => {
  await writeStringIntoFile(outputPath, '{')

  await compareLevelWrite2File(
    {
      path: referencePath
    },
    {
      path: comparePath
    },
    outputPath,
    '$'
  )

  await writeStringIntoFile(outputPath, '}')
}
