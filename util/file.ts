import { access, constants } from "fs";

/**
 * check path passed-in is valid or not
 * @param filePath file path to check
 * @returns
 */
export const isValidPath = (filePath: string): Promise<boolean> =>
  new Promise((resolve) =>
    access(filePath, constants.R_OK, (err) => {
      resolve(!!err);
    }),
  );
