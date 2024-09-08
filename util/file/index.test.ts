import { readPartialFile } from './index'

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
