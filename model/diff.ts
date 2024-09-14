// level compare result
export enum DIFF_RESULT {
  SAME, // not changed
  ADD, // node is added compared with previous node
  REMOVED, // node is removed compared with previous node
  MOVED, // node is moved compared with previous node
  VALUE_CHANGE // leaf node value changed
}
