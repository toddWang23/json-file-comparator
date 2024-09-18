import { DATA_TYPE } from 'model/dataProcess'
import { getSectionType } from './index'

it('getSectionType: brace', () => {
  const result = getSectionType('{')
  expect(result).toBe(DATA_TYPE.OBJECT)
})

it('getSectionType: square', () => {
  const result = getSectionType('[')
  expect(result).toBe(DATA_TYPE.ARRAY)
})

it('getSectionType: string', () => {
  const result = getSectionType('"')
  expect(result).toBe(DATA_TYPE.STRING)
})

it('getSectionType: number', () => {
  const result = getSectionType('9')
  expect(result).toBe(DATA_TYPE.NUMBER)
})

it('getSectionType: empty', () => {
  const result = getSectionType('q')
  expect(result).toBe(undefined)
})
