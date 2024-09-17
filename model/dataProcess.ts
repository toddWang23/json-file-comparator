export interface RetrievalPositionSlice {
  key: string
  start: number
  end: number
}

export interface JsonLevel {
  startIndex: number
  endIndex: number
  type: DATA_TYPE
  attributeName: string
}

export enum DATA_TYPE {
  STRING = 'string',
  NUMBER = 'number',
  ARRAY = 'array',
  OBJECT = 'object'
}
