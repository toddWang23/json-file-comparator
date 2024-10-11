import { open } from 'fs/promises'
import { FileWriteSeriesProcessor } from 'util/file/seriesWrite'
import { DIFF_RESULT } from 'model/diff'
import { generateLevelDiffInfo } from './diffInfo'
import { compareDataInLevel } from './diffCompare'
import { SourceLevelDetail } from './type'
import { throwErrorWithCode } from 'util/error'
import { WRITE_FILE_ERROR } from 'constant/errCode'
import { WRITE_FILE_ERROR_MSG } from 'constant/errorMessage'
import { JsonLevel } from 'model/dataProcess'

/**
 * generate child node compare info array, resume compare info
 * @param referenceInfo reference compare info
 * @param compareInfo compared node compare info
 * @param parentPath parent json-path path
 * @param attribute current comparing attribute name
 * @param writeHandler file write handler
 * @param readSize file read chunk size
 * @returns finish Promise status
 */
const compareNextLevel = (
  referenceInfo: SourceLevelDetail<JsonLevel[]>,
  compareInfo: SourceLevelDetail<JsonLevel[]>,
  parentPath: string,
  attribute: string,
  writeHandler: FileWriteSeriesProcessor,
  readSize?: number
) => {
  const { path: referencePath, levelInfo: referenceLevel = [] } = referenceInfo
  const { path: comparePath, levelInfo: compareLevel = [] } = compareInfo

  const refNode = referenceLevel.find(v => v.attributeName === attribute)
  const compareNode = compareLevel.find(v => v.attributeName === attribute)

  const nextLevelJsonPath = `${parentPath}.${attribute}`

  if (refNode && compareNode) {
    return compareLevelWrite2File(
      {
        path: referencePath,
        levelInfo: refNode
      },
      {
        path: comparePath,
        levelInfo: compareNode
      },
      writeHandler,
      nextLevelJsonPath,
      readSize
    )
  }

  return Promise.resolve(undefined)
}

/**
 * compare two JSON node and write difference into file
 * @param referenceDetail reference compare info
 * @param compareDetail compare node compare info
 * @param writeHandler write file handler
 * @param jsonPath parent level json path
 * @param readSize file read chunk size
 * @returns
 */
export const compareLevelWrite2File = async (
  referenceDetail: SourceLevelDetail<JsonLevel>,
  compareDetail: SourceLevelDetail<JsonLevel>,
  writeHandler: FileWriteSeriesProcessor,
  jsonPath: string,
  readSize?: number
) => {
  const { path: referenceSourcePath, levelInfo: referenceTask } =
    referenceDetail

  const { path: compareSourcePath, levelInfo: compareTask } = compareDetail

  // not catch errors to expose to caller
  const [referenceLevels, compareLevels] = await Promise.all([
    generateLevelDiffInfo(referenceSourcePath, referenceTask, readSize),
    generateLevelDiffInfo(compareSourcePath, compareTask, readSize)
  ])

  const levelResults = await compareDataInLevel(
    referenceLevels,
    compareLevels,
    referenceSourcePath,
    compareSourcePath
  )

  const { length } = levelResults

  const taskArr: Array<Promise<undefined>> = []

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
        writeHandler.pushReadStream([
          `"${jsonPath}.${attribute}":{"type": "move_change", "prevIndex": ${prevIndex}, 
"changedIndex": ${changedIndex}, "prevValue": `,
          {
            fromPath: referenceSourcePath,
            startIndex: refStartFileIndex,
            endIndex: refEndFileIndex
          },
          `, "changedValue": "`,
          {
            fromPath: compareSourcePath,
            startIndex: compareStartFileIndex,
            endIndex: compareEndFileIndex
          },
          '},'
        ])

        // compare deeper nodes
        if (!isLeaf) {
          taskArr.push(
            compareNextLevel(
              {
                path: referenceSourcePath,
                levelInfo: referenceLevels
              },
              {
                path: compareSourcePath,
                levelInfo: compareLevels
              },
              jsonPath,
              attribute,
              writeHandler,
              readSize
            )
          )
        }
        break

      case DIFF_RESULT.VALUE_CHANGE:
        writeHandler.pushReadStream([
          `"${jsonPath}.${attribute}":{"type": "value_change", "prevValue": `,
          {
            fromPath: referenceSourcePath,
            startIndex: refStartFileIndex,
            endIndex: refEndFileIndex
          },
          `, "changedValue": `,
          {
            fromPath: compareSourcePath,
            startIndex: compareStartFileIndex,
            endIndex: compareEndFileIndex
          },
          '},'
        ])

        // compare deeper nodes
        if (!isLeaf) {
          taskArr.push(
            compareNextLevel(
              {
                path: referenceSourcePath,
                levelInfo: referenceLevels
              },
              {
                path: compareSourcePath,
                levelInfo: compareLevels
              },
              jsonPath,
              attribute,
              writeHandler,
              readSize
            )
          )
        }
        break
      case DIFF_RESULT.MOVED:
        writeHandler.pushReadStream([
          `"${jsonPath}.${attribute}": {"type": "move", "prevIndex": ${prevIndex}, "changedIndex": ${changedIndex}},`
        ])
        break
      case DIFF_RESULT.SAME:
        break
      case DIFF_RESULT.UNDEFINED:
        taskArr.push(
          compareNextLevel(
            {
              path: referenceSourcePath,
              levelInfo: referenceLevels
            },
            {
              path: compareSourcePath,
              levelInfo: compareLevels
            },
            jsonPath,
            attribute,
            writeHandler,
            readSize
          )
        )
        break
      case DIFF_RESULT.ADD:
        writeHandler.pushReadStream([
          `"${jsonPath}.${attribute}": {"type": "add", "content": `,
          {
            fromPath: compareSourcePath,
            startIndex: compareLevels[i].startIndex,
            endIndex: compareLevels[i].endIndex
          },
          `},`
        ])
        break
      case DIFF_RESULT.REMOVED:
        writeHandler.pushReadStream([
          `"${jsonPath}.${attribute}": {"type": "removed", "content": `,
          {
            fromPath: referenceSourcePath,
            startIndex: referenceLevels[i].startIndex,
            endIndex: referenceLevels[i].endIndex
          },
          `},`
        ])

        break
      default:
        break
    }
  }

  return Promise.all(taskArr).then(() => undefined)
}

/**
 * compare `reference` JSON file with `compare` JSON file and write result into `output` file
 * @param referencePath reference file path
 * @param comparePath compared file path
 * @param outputPath compare result file path
 * @returns
 */
export const compareFileWrite2File = async (
  referencePath: string,
  comparePath: string,
  outputPath: string,
  readSize?: number
) => {
  const fileWriteHandler = new FileWriteSeriesProcessor(outputPath)

  fileWriteHandler.pushReadStream(['{'])

  await compareLevelWrite2File(
    {
      path: referencePath
    },
    {
      path: comparePath
    },
    fileWriteHandler,
    '$',
    readSize
  )

  return new Promise(resolve => {
    fileWriteHandler.on('end', () => {
      // remove the last comma, and fill brace
      open(outputPath, 'r+').then(fileHandler => {
        fileHandler.stat().then(fileInfo => {
          const fileSize = fileInfo.size
          fileHandler
            .truncate(fileSize - 1)
            .then(() => {
              fileHandler.write('}', fileSize - 1)
              resolve(undefined)
            })
            .catch(err => {
              throwErrorWithCode(WRITE_FILE_ERROR, WRITE_FILE_ERROR_MSG, err)
            })
        })
      })
    })

    // will wait until file is closed
    fileWriteHandler.close()
  })
}
