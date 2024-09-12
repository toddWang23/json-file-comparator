export interface RetrievalPositionSlice {
  key: string
  start: number
  end: number
}

export interface DiffLevel {
  startIndex: number
  endIndex: number
  attributeName: string
}

export enum DATA_TYPE {
  STRING = 'string',
  NUMBER = 'number',
  ARRAY = 'array',
  OBJECT = 'object'
}
