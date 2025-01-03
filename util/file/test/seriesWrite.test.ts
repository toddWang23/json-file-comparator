import path from 'path'
import { FileWriteSeriesProcessor } from '../seriesWrite'
import { existsSync, readFileSync, rmSync } from 'fs'

const updatePath = path.join(__dirname, './seriesWrite.test.txt')

afterAll(() => {
  rmSync(updatePath)
})

it('FileWriteSeriesProcessor: write chunks into file', () => {
  const sourcePath = path.join(__dirname, './data.test.txt')

  if (existsSync(updatePath)) {
    if (existsSync(updatePath)) {
      rmSync(updatePath)
    }
  }

  const fileWriteHandler = new FileWriteSeriesProcessor(updatePath)

  fileWriteHandler.pushReadStream([
    {
      fromPath: sourcePath,
      startIndex: 1,
      endIndex: 3
    },
    '\n'
  ])

  fileWriteHandler.pushReadStream([
    {
      fromPath: sourcePath,
      startIndex: 0
    },
    '\n'
  ])

  fileWriteHandler.pushReadStream([
    {
      fromPath: sourcePath,
      endIndex: 8
    },
    '\n',
    {
      fromPath: sourcePath
      // startIndex: 1,
      // endIndex: 2
    }
  ])

  fileWriteHandler.close()

  return new Promise(resolve => {
    fileWriteHandler.on('end', () => {
      // open(updatePath).then(fileHandler => {

      // })
      const fileContent = readFileSync(updatePath, { encoding: 'utf8' })

      const fileContentLines = fileContent.split('\n')

      expect(fileContentLines.length).toBe(4)

      expect(fileContentLines[0].length).toBe(2)

      resolve(undefined)
    })
  })
}, 50000)
