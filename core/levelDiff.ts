import { DiffLevel } from 'model/dataProcess'
import { DIFF_RESULT } from 'model/diff'

/**
 * compare difference level info
 * @param referenceDiffInfo reference JSON level info
 * @param compareDiffInfo compared JSON level info
 * @returns {DIFF_RESULT}
 */
export const compareSameLevelData = (
  referenceDiffInfo: DiffLevel[],
  compareDiffInfo: DiffLevel[]
) => {
  // TODO: improve the performance here
  const referenceObj = referenceDiffInfo.reduce(
    (formedData, levelInfo) => {
      const { attributeName } = levelInfo
      formedData[attributeName] = levelInfo

      return formedData
    },
    {} as Record<string, DiffLevel>
  )
}
