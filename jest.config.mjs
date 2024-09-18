// import type { Config } from 'jest'
import { defaults } from 'jest-config'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  moduleNameMapper: {
    'model/(.*)': '<rootDir>/model/$1',
    'util/(.*)': '<rootDir>/util/$1',
    constant: '<rootDir>/constant'
  },
  // extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts?$': [
      'babel-jest',
      { configFile: path.resolve(__dirname, 'babel.config.js') }
    ]
  },
  transformIgnorePatterns: [
    'constant/'
  ]
}

export default config
