const fs = require('fs');

/**
 * Read a JSON file and return its content as a JavaScript object
 * @param filePath
 * @param silentErrors
 * @return {{}}
 */
export function readJson(filePath, silentErrors = false) {

  let jsonData = {};

  // Is a file exists
  if (!fs.existsSync(filePath)) {
    if (!silentErrors) {
      console.error('File not found:', filePath);
    }
    return jsonData;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8'); // 'utf8' encoding is important
    jsonData = JSON.parse(data); // Parse the JSON string into a JavaScript object
  } catch (err) {
    if (!silentErrors) {
      console.error('Error reading or parsing JSON file:', err);
    }
  }

  return jsonData;

}
