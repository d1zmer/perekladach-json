import {defineArgs} from "./tools/define-args";
import {readJson} from "./tools/read-json";
import {translateFile} from "./tools/translate-file";
import {writeJson} from "./tools/write-json";

const args = defineArgs();

const sourceTranslations = readJson(args.source);

const targetTranslation = await translateFile(args);
if (targetTranslation === null) {
  console.error("Failed to translate the file");
  process.exit(1);
}

if (Object.keys(targetTranslation).length === 0 ) {
  console.warn("No translations were added");
  process.exit(0);
}

if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
  console.warn("Some translations failed");
}

// Save the target translation
writeJson(targetTranslation, args);
