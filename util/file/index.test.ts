import path from 'path'
import {
  isValidPath,
  readPartialFile,
  writeFileBasedIndex,
  writeStringIntoFile
} from './index'
import { readFile, rmSync, writeFile } from 'fs'

beforeEach(() => {
  return new Promise((resolve, reject) => {
    writeFile(
      './util/file/data.test.txt',
      'test line',
      {
        flag: 'w'
      },
      err => {
        if (err) {
          reject(err)
        } else {
          resolve(undefined)
        }
      }
    )
  })
})

it('readPartialFile: first character', () => {
  return readPartialFile({
    path: './util/file/data.test.txt',
    start: 0,
    end: 1
  }).then(data => {
    expect(data).toBe('te')
  })
})

it('readPartialFile: default all file', () => {
  return readPartialFile({
    path: './util/file/data.test.txt'
  }).then(data => {
    expect(data).toBe('test line')
  })
})

it('isValidPath: path is valid', () => {
  const updatePath = path.join(__dirname, './data.test.txt')

  return isValidPath(updatePath).then(data => {
    expect(data).toBe(true)
  })
})

it('isValidPath: path is not valid', () => {
  const updatePath = path.join(__dirname, './a')
  return isValidPath(updatePath).then(data => {
    expect(data).toBe(false)
  })
})

it('writeStringIntoFile: write content into file', () => {
  return writeStringIntoFile('./util/file/data.test.txt', 'aa')
    .then(data => {
      expect(data).toBe(undefined)
    })
    .then(() => {
      return new Promise(resolve => {
        readFile('./util/file/data.test.txt', (_, data) => {
          expect(data.toString()).toBe('test lineaa')

          resolve(undefined)
        })
      })
    })
})

it('writeStringIntoFile: overwrite content into file', () => {
  return writeStringIntoFile('./util/file/data.test.txt', 'aa', false)
    .then(data => {
      expect(data).toBe(undefined)
    })
    .then(() => {
      return new Promise(resolve => {
        readFile('./util/file/data.test.txt', (_, data) => {
          expect(data.toString()).toBe('aa')
          resolve(undefined)
        })
      })
    })
})

it('writeFileBasedIndex: write partial file into another file ', () => {
  rmSync('./util/file/dataCopy.test.txt')

  return writeFileBasedIndex(
    './util/file/dataCopy.test.txt',
    './util/file/data.test.txt',
    0,
    0
  ).then(() => {
    return new Promise(resolve => {
      readFile('./util/file/dataCopy.test.txt', (_, data) => {
        expect(data.toString()).toBe('t')
        resolve(undefined)
      })
    })
  })
})
