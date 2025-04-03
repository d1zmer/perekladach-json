/**
 * Define arguments from command line
 * @return {{}}
 */
export function defineArgs() {

  // Check if the script is being run directly
  const args = process.argv.slice(2); // Remove 'node' and script path
  if (args.length === 0) {
    console.error("No arguments provided.");
    process.exit(1);
  }

  // Parse the arguments
  const parsedArgs = args.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key.startsWith('-')) {
      acc[formatKey(key)] = formatValue(value);
    }
    return acc;
  }, {});

  // Check if the required arguments are present
  if (parsedArgs.length === 0) {
    console.error("No arguments passed.");
    process.exit(1);
  }

  return parsedArgs;

}

/**
 * Format the key by removing leading dashes
 * @param key
 */
function formatKey( key ) {

  key = key.replace(/^-+/, ''); // Remove leading dashes
  const shortKeys = {
    'f': 'from',
    't': 'to',
    's': 'source',
    'o': 'override',
    'd': 'delay',
    'l': 'log',
    'h': 'help',
  };

  // Check if the key is a short key
  if (shortKeys[key]) {
    return shortKeys[key];
  }

  return key; // Return the key as is

}

/**
 * Format the value based on its content
 * @param value
 * @return {number|{}|*|null|boolean}
 */
function formatValue( value ) {

  switch (value) {

    case 'true':
      return true;

    case 'false':
      return false;

    case 'null':
      return null;

    default:

      // If string contains , convert to array
      if (value.includes(',')) {
        return value.split(',').map(item => item.trim());
      }

      // If string contains : convert to object
      if (value.includes(':')) {
        const obj = {};
        value.split(',').forEach(item => {
          const [key, val] = item.split(':');
          obj[key.trim()] = val.trim();
        });
        return obj;
      }

      // If string is only digits, convert to number
      if (!isNaN(value)) {
        return Number(value);
      }

      // Otherwise, return the string as is
      return value;

  }

}
