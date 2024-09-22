import type { Config } from 'jest'
import { defaults } from 'jest-config'

const config: Config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  moduleNameMapper: {
    'model/(.*)': '<rootDir>/model/$1',
    '^util/(.*)': '<rootDir>/util/$1',
    '^core/(.*)': '<rootDir>/core/$1',
    '^constant/(.*)': '<rootDir>/constant/$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  }
}

export default config
