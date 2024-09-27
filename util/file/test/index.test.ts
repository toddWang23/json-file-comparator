import path from 'path'
import { isValidPath, readPartialFile } from '../index'
import { writeFile } from 'fs'

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
