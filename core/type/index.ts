import { DATA_TYPE, JsonLevel } from 'model/dataProcess'

export interface SourceLevelDetail<T> {
  path: string
  levelInfo?: T
}

export interface NextLevelTask {
  jsonPath: string

  nextCompare: JsonLevel
  nextReference: JsonLevel
}

export enum SearchStage {
  // type = 1,
  key = 1, // if key's end quote is not matched, then it's in this stage
  colon, // if colon is not matched, or colon is matched but value is not matched(quote not matched for string, left bracket/brace for array/object), then it's in this stage
  type,
  value // if left bracket/brace is matched, or number
}

export interface SymbolElement {
  symbol: string | number | boolean // number type is marked as 0, string is marked as ", boolean is marked as true, array is marked as [, object is marked as {, prefix slash is marked as \
  index: number
}

export interface LevelAccumulation {
  parentType?: DATA_TYPE // parent level type
  levels: JsonLevel[] // all proceed same level items
  leftSymbolStack?: SymbolElement[] // all not matched symbol stack, index for truncate value start
  remainLevelInfo?: Partial<JsonLevel> & { stage?: SearchStage } // not finished
  throughSize?: number // processed file size by byte
}

export interface ValueCompare {
  path: string
  startIndex: number
  endIndex: number
}
