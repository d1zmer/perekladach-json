/**
 * Define paths for source and target files
 * @param from - The source language code
 * @param to - The target language code
 * @param sourcePath - The source file path
 * @return {string}
 */
export function definePaths(from, to, sourcePath) {


  // If from and to are provided, replace it from with to
  if (from) {
    return sourcePath.replace(from, to);
  }

  // If source has al least one '/', replace the last part with to
  if (sourcePath.includes('/')) {
    return sourcePath.replace(/\/[^/]*$/, `/${to}.json`);
  }

  // If a source has no '/', add to the end
  return `${to}.json`;

}
