import { isValidSymbol } from './index'

it('isValidSymbol: no slash valid character', () => {
  expect(isValidSymbol(']')).toBe(true)
})

it('isValidSymbol: prefix slash is not valid character', () => {
  expect(isValidSymbol(']', '\\')).toBe(false)
})

it('isValidSymbol: invalid character', () => {
  expect(isValidSymbol('a')).toBe(false)
})
