import { readFile } from "fs";

export const compareBasedOnPath = (
  referencePath: string,
  comparedFilePath: string,
) => {
  const referenceRS = readFile(referencePath, "utf-8");
};
