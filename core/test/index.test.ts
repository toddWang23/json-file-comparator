import { existsSync, readFileSync, rmSync } from 'fs'
import { compareJSON2File } from '../../index'
import path from 'path'

const resultFilePath = path.join(__dirname, './compareResult.txt')

afterAll(() => {
  if (existsSync(resultFilePath)) {
    rmSync(resultFilePath)
  }
})

it('compareFileWrite2File: compare one node change file', () => {
  const compareFilePath = path.join(__dirname, './referenceDiffFile.json')
  const referenceFilePath = path.join(__dirname, './referenceFile.json')

  if (existsSync(resultFilePath)) {
    rmSync(resultFilePath)
  }

  return compareJSON2File(
    referenceFilePath,
    compareFilePath,
    resultFilePath
  ).then(() => {
    const data = readFileSync(resultFilePath)

    const dataStr = data.toString()
    const obj = JSON.parse(dataStr)

    expect(Object.keys(obj).length).toBe(4)
  })
})
