import { existsSync, readFileSync, rmSync } from 'fs'
import { compareFileWrite2File } from '../index'
import path from 'path'
const resultFilePath = path.join(__dirname, './compareResult2.txt')

afterAll(() => {
  if (existsSync(resultFilePath)) {
    rmSync(resultFilePath)
  }
})

it('compareFileWrite2File: compare different type node', () => {
  const compareFilePath = path.join(__dirname, './arrayJson.json')
  const referenceFilePath = path.join(__dirname, './objJson.json')

  if (existsSync(resultFilePath)) {
    rmSync(resultFilePath)
  }

  return compareFileWrite2File(
    referenceFilePath,
    compareFilePath,
    resultFilePath
  )
    .then(() => {
      const data = readFileSync(resultFilePath)

      const dataStr = data.toString()
      const obj = JSON.parse(dataStr)

      return obj
    })
    .then(obj => {
      let removedNodes = 0,
        addedNodes = 0

      Object.values(obj).forEach(v => {
        ;(v as any).type === 'add' && addedNodes++
        ;(v as any).type === 'removed' && removedNodes++
      })

      expect(Object.keys(obj).length).toBe(7)
      expect(removedNodes).toBe(4)
      expect(addedNodes).toBe(3)

      return Promise.resolve()
    })
})
