import {defineArgs} from "./tools/define-args";
import {translateFile} from "./translate/translate-file";
import {writeJson} from "./disk/write-json";

// Define the arguments
const args = defineArgs();

// Translate the source file to the target
const targetTranslation = await translateFile(args);

// Save the target translation
writeJson(targetTranslation, args);
