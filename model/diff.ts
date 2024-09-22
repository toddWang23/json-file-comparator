// level compare result
export enum DIFF_RESULT {
  SAME, // not changed
  ADD, // node is added compared with previous node
  REMOVED, // node is removed compared with previous node
  MOVED, // node is moved compared with previous node
  VALUE_CHANGE, // leaf node value changed
  MOVED_CHANGE,
  UNDEFINED // still has leaves, diff result not determined
}

export interface LevelDiffResult {
  type: DIFF_RESULT
  attribute: string
  // move
  prevIndex?: number
  changedIndex?: number
  // add/change
  compareStartFileIndex?: number
  compareEndFileIndex?: number
  // change/removed
  refStartFileIndex?: number
  refEndFileIndex?: number

  isLeaf: boolean
}

export interface AttrMoveResult {
  type: DIFF_RESULT.MOVED
  prevIndex: number
  changedIndex: number
}

export interface AttrExistResult {
  type: DIFF_RESULT.ADD | DIFF_RESULT.REMOVED
  content: string
}

export interface AttrChangeResult {
  type: DIFF_RESULT.VALUE_CHANGE
  prevValue: string
  changedValue: string
}

export interface AttrMoveChangeResult {
  type: DIFF_RESULT.MOVED_CHANGE
  prevValue: string
  changedValue: string
  prevIndex: number
  changedIndex: number
}

export type FileDiffResult =
  | AttrMoveResult
  | AttrExistResult
  | AttrChangeResult
  | AttrMoveChangeResult
