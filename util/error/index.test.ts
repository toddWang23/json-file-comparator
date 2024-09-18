import { throwErrorWithCode } from './index'

it('throwErrorWithCode: write log and exit program', () => {
  const mockCode = 1001
  const errMessage = 'test message'

  jest.spyOn(process, 'exit').mockImplementation(code => {
    expect(code).toBe(mockCode)
    return undefined as never
  })

  jest.spyOn(console, 'error').mockImplementation((...msg) => {
    expect(msg.length).toBe(1)
    expect(msg[0]).toBe(errMessage)
  })

  throwErrorWithCode(1001, errMessage)
})
