/**
 * Define paths for source and target files
 * @param args
 * @return {string}
 */
export function definePaths(args) {

  const sourcePath = args.source;

  // If from and to are provided, replace it from with to
  if (args.from) {
    return sourcePath.replace(args.from, args.to);
  }

  // If source has al least one '/', replace the last part with to
  if (sourcePath.includes('/')) {
    return sourcePath.replace(/\/[^/]*$/, `/${args.to}.json`);
  }

  // If a source has no '/', add to the end
  return `${args.to}.json`;

}
