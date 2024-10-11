export interface FileReadOption {
  path: string
  start?: number
  end?: number
  readSize?: number
}

export type WritableData =
  | {
      fromPath: string
      startIndex?: number
      endIndex?: number
    }
  | string
