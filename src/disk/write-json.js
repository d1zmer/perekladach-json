const fs = require('fs');

/**
 * Write a JavaScript object to a JSON file
 * @param object
 * @param args
 */
export function writeJson(object, args) {

  // If the object is null, the translation failed
  if (object === null) {
    console.error("Failed to translate the file");
    process.exit(1);
  }

  // If the object is empty, no translations were added
  if (Object.keys(object).length === 0 ) {
    console.warn("No translations were added");
    process.exit(0);
  }

  try {
    const jsonString = JSON.stringify(object, null, 2);
    fs.writeFileSync(args.target, jsonString, 'utf8');
  } catch (e) {
    console.error('Error writing JSON file:', e);
  }

}
