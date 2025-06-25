import {Args} from "../types";

/**
 * Define arguments from command line
 */
export function defineArgs(): Args {
  const args = process.argv.slice(2); // Skip node and script path
  if (args.length === 0) {
    console.error("No arguments provided.");
    process.exit(1);
  }

  const parsedArgs: Args = {};

  args.forEach((arg) => {
    if (!arg.startsWith('--') || !arg.includes('=')) return;

    const stripped = arg.replace(/^--/, '');
    const [keyRaw, rawValue = ''] = stripped.split('=');
    if (!keyRaw) return;

    const key = formatKey(keyRaw);
    parsedArgs[key] = formatValue(rawValue);
  });

  if (Object.keys(parsedArgs).length === 0) {
    console.error("No arguments passed.");
    process.exit(1);
  }

  if (!parsedArgs.from) {
    parsedArgs.from = 'auto';
  }

  return parsedArgs;
}

function formatKey(key: string): string {
  const shortKeys: Record<string, string> = {
    f: 'from',
    t: 'to',
    s: 'source',
    o: 'override',
    d: 'delay',
    l: 'log',
    h: 'help',
  };

  return shortKeys[key] ?? key;
}

function formatValue(value: string): string | number | boolean | null | string[] | Record<string, any> {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;

  // Object-style: key1:val1,key2:val2
  if (value.includes(':')) {
    const obj: Record<string, any> = {};
    value.split(',').forEach((item) => {
      const [k, v] = item.split(':');
      if (k && v !== undefined) {
        obj[k.trim()] = v.trim();
      }
    });
    return obj;
  }

  // Array-style: val1,val2
  if (value.includes(',')) {
    return value.split(',').map((item) => item.trim());
  }

  // Number check
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  return value;
}
