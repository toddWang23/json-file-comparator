import { JsonLevel } from 'model/dataProcess'

export interface SourceLevelDetail {
  path: string
  levelInfo: Array<JsonLevel>
}

export interface NextLevelTask {
  jsonPath: string

  nextCompare: JsonLevel
  nextReference: JsonLevel
}
