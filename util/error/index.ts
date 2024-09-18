/**
 * throw error message and exit program
 * @param code error code to throw
 * @param message error message
 */
export const throwErrorWithCode = (code: number, ...message: string[]) => {
  console.error(...message);
  process.exit(code);
};
