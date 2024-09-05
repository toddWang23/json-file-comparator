import { REFERENCE_PARAM, COMPARE_PARAM, OUTPUT_PARAM } from "../constant";

/**
 * convert command paramater to key-value pair object
 * @param inputArr input paramater array
 * @returns 
 */
export const getParamFromStr = (inputArr: string[]): Record<string, string> => inputArr.reduce((prev, inputStr) => {
    if (inputStr.startsWith('--')) {
        const paramStr = inputStr.substring(2)
        const [key, value] = paramStr.split('=')

        if (key) {
            return {
                ...prev,
                [key]: value
            }
        }
    }

    return prev
}, {})