/**
 * Define arguments from command line
 * @return {{}}
 */
export function defineArgs() {

  const args = process.argv.slice(2); // Slice to remove node and script name

  if (args.length === 0) {
    console.error("No arguments provided.");
    process.exit(1);
  }

  let options = {};
  args.forEach(argString => {

    // Split by '='
    const argsSpited = argString.split('=');

    let key = argsSpited[0].trim();
    let value = argsSpited[1].trim();
    if (key === 'to') {
      value = value.split(',').map(v => v.trim());
    }

    options[key] = value;

  });

  return options;

}
