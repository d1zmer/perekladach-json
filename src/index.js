import {defineArgs} from "./tools/define-args";
import {translateQueue} from "./translate/translate-queue";

// Define the arguments
const args = defineArgs();

translateQueue(args).then(()=>{
  const log = args['log'] ?? 'info';
  if (!log || log !== 'none') {
    console.info("Translation completed successfully");
  }
});

