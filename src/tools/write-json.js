const fs = require('fs');

export function writeJson(object, args) {

  try {
    const jsonString = JSON.stringify(object, null, 2);
    fs.writeFileSync(args.target, jsonString, 'utf8');
  } catch (e) {
    console.error('Error writing JSON file:', e);
  }

}
