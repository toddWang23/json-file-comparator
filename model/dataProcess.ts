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
