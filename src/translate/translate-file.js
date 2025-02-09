import {translateSentence} from "./translate-sentence";
import {readJson} from "../disk/read-json";
import {calcSentences} from "../tools/calc-sentences";

let total = 0;
let translated = 0;
let skipped = 0;
let failed = 0;

/**
 * Recursively translate the JSON object
 * @param obj
 * @param args
 * @param targetTranslation
 * @param isOverride
 * @return {Promise<void>}
 */
async function translateJsonObject(obj, args, targetTranslation, isOverride) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      if (!targetTranslation[key]) {
        targetTranslation[key] = {};
      }
      await translateJsonObject(value, args, targetTranslation[key], isOverride);
    } else {
      if (!isOverride && targetTranslation[key] !== undefined) {
        console.info(`[${translated}/${total}] Skipping ${key}`);
        translated++;
        skipped++;
        continue;
      }

      const translation = await translateSentence(value, args);
      if (translation === null) {
        console.warn(`[${translated}/${total}] Failed to translate ${key}`);
        translated++;
        failed++;
        continue;
      }

      targetTranslation[key] = translation;

      // Log the translation
      console.info(`[${translated}/${total}] Translated ${key}: ${translation}`);
      translated++;

      // Add a 1-second timeout
      await new Promise(resolve => setTimeout(resolve, args['timeout'] ?? 1000));
    }
  }
}

/**
 * Translate the source file to the target
 * @param args
 * @return {Promise<{}>}
 */
export async function translateFile(args) {

  // Read the source and target files
  const sourceTranslations = readJson(args.source);
  const targetTranslation = readJson(args.target, true);

  // Check override flag
  const isOverride = (args['override'] ?? 'false') === 'true';

  // Count the number of sentences
  total = calcSentences(sourceTranslations);

  await translateJsonObject(sourceTranslations, args, targetTranslation, isOverride);

  // If the target translation is empty, the translation failed
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }

  console.info(`Translated ${translated} sentences with ${skipped} skipped and ${failed} failed`);

  return targetTranslation;
}
