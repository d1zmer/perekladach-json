interface Args {
  source?: string;
  from?: string;
  to?: string;
  override?: boolean;
  delay?: number;
  log?: 'info' | 'verbose' | 'none';
  [key: string]: string | number | boolean | undefined | null | Record<string, any> | Array<string>;
}

/**
 * Define arguments from command line
 * @return {{}}
 */
export function defineArgs(): Args {

  // Check if the script is being run directly
  const args = process.argv.slice(2); // Remove 'node' and script path
  if (args.length === 0) {
    console.error("No arguments provided.");
    process.exit(1);
  }

  let parsedArgs: Args = {};
  args.forEach((arg) => {

    // If the argument starts with --
    if (!arg.startsWith('--') || !arg.includes('=')) {
      return;
    }

    // Replace -- with empty string
    arg = arg.replace(/^--/, '');

    // Split by =
    const [key, value] = arg.split('=');

    // If the key is empty, skip it
    if (!key || key.trim() === '') {
      return;
    }

    parsedArgs[formatKey(key)] = formatValue(value.toString()); // Use empty string if value is undefined

  });

  // Check if the required arguments are present
  if (Object.keys(parsedArgs).length === 0) {
    console.error("No arguments passed.");
    process.exit(1);
  }

  // If from is not provided, set it to 'auto'
  if (!parsedArgs.from) {
    parsedArgs.from = 'auto';
  }

  return parsedArgs;

}

/**
 * Format the key by removing leading dashes
 * @param key
 */
function formatKey(key: string): string {

  key = key.replace(/^-+/, ''); // Remove leading dashes
  const shortKeys: { [key: string]: string } = {
    'f': 'from',
    't': 'to',
    's': 'source',
    'o': 'override',
    'd': 'delay',
    'l': 'log',
    'h': 'help',
  };

  // Check if the key is a short key
  if (shortKeys.hasOwnProperty(key)) {
    return shortKeys[key];
  }

  return key; // Return the key as is

}

/**
 * Format the value based on its content
 * @param value
 * @return {number|{}|*|null|boolean}
 */
function formatValue(value: string): number | Record<string, any> | Array<string> | boolean | null | string {

  switch (value) {

    case 'true':
      return true;

    case 'false':
      return false;

    case 'null':
      return null;

    default:

      // If a string contains, convert to array
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
