import { JsonLevel } from 'model/dataProcess'

export interface SourceLevelDetail {
  path: string
  levelInfo?: JsonLevel
}

export interface NextLevelTask {
  jsonPath: string

  nextCompare: JsonLevel
  nextReference: JsonLevel
}
