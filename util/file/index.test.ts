import { isValidPath, readPartialFile, writeStringIntoFile } from './index'

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
  return isValidPath('./util/file/data.test.txt').then(data => {
    expect(data).toBe(true)
  })
})

it('isValidPath: path is not valid', () => {
  return isValidPath('./util/file').then(data => {
    expect(data).toBe(false)
  })
})

it('writeStringIntoFile: write content into file', () => {
  return writeStringIntoFile('./util/file/data.test.txt', 'aa').then(data => {
    expect(data).toBe(true)
  })
})
