import {defineArgs} from "./tools/define-args";
import {translateQueue} from "./translate/translate-queue";

// Define the arguments
const args = defineArgs();

translateQueue(args).then(()=>{
  console.log("Translation complete");
});

