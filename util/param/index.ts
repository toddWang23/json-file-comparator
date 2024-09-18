/**
 * convert command parameter to key-value pair object
 * @param inputArr input parameter array
 * @returns
 */
export const getParamFromStr = (inputArr: string[]): Record<string, string> =>
  inputArr.reduce((prev, inputStr) => {
    if (inputStr.startsWith('--')) {
      const paramStr = inputStr.substring(2)
      const [key, value] = paramStr.split('=')

      if (key) {
        return {
          ...prev,
          [key.trim()]: value.trim()
        }
      }
    }

    return prev
  }, {})
