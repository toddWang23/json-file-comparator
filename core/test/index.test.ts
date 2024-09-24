import { readFile } from 'fs'
import { compareFileWrite2File } from '../index'
import path, { resolve } from 'path'

it('compareFileWrite2File: compare one node change file', () => {
  const compareFilePath = path.join(__dirname, './referenceDiffFile.json')
  const referenceFilePath = path.join(__dirname, './referenceFile.json')
  const resultFilePath = path.join(__dirname, './compareResult.txt')

  return compareFileWrite2File(
    referenceFilePath,
    compareFilePath,
    resultFilePath
  ).then(data => {
    return new Promise((resolve, reject) => {
      readFile(resultFilePath, (err, data) => {
        const dataStr = data.toString()
        const obj = JSON.parse(dataStr)

        expect(Object.keys(obj).length).toBe(4)
      })
    })
  })
})
