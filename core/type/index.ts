import { JsonLevel } from 'model/dataProcess'

export interface SourceLevelDetail<T> {
  path: string
  levelInfo?: T
}

export interface NextLevelTask {
  jsonPath: string

  nextCompare: JsonLevel
  nextReference: JsonLevel
}
