import path from 'path'
import { generateLevelDiff } from '../fileDiff'

it('generateLevelDiff: get object base level info', () => {
  const filePath = path.join(__dirname, './compareFile.json')
  return generateLevelDiff(filePath).then(data => {
    console.log(JSON.stringify(data))
  })
})
