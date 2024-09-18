import { getParamFromStr } from './index'

it('getParamFromStr: input with parameters', () => {
  const result = getParamFromStr(['--param1= 1', '--param2 =2', 'param3=3'])

  expect(result.param1).toBe('1')
  expect(result.param2).toBe('2')
  expect(result.param3).toBe(undefined)
})
