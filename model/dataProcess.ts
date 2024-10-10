export interface RetrievalPositionSlice {
  key: string
  start: number
  end: number
}

export interface JsonLevel {
  startIndex: number // included the first character, like for object, the startIndex is '{'
  endIndex: number // included the last character,like for array, the endIndex should be ']'.
  type: DATA_TYPE
  attributeName: string
}

export enum DATA_TYPE {
  STRING = 'string',
  NUMBER = 'number',
  ARRAY = 'array',
  OBJECT = 'object',
  BOOL = 'boolean'
}
