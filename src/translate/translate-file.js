import {translateSentence} from "./translate-sentence";
import {readJson} from "../disk/read-json";
import {calcSentences} from "../tools/calc-sentences";

let total = 0;
let translated = 0;
let skipped = 0;
let failed = 0;

/**
 * Recursively translate the JSON object
 * @param fileArgs
 * @param sourceTranslations
 * @param targetTranslation
 * @return {Promise<void>}
 */
async function translateJsonObject(fileArgs, sourceTranslations, targetTranslation) {

  const isOverride = fileArgs['override'];
  const log = fileArgs['log'] ?? 'info';

  for (const [key, value] of Object.entries(sourceTranslations)) {
    if (typeof value === 'object' && value !== null) {
      if (!targetTranslation[key]) {
        targetTranslation[key] = {};
      }
      await translateJsonObject(fileArgs, value, targetTranslation[key]);
    } else {
      if (!isOverride && targetTranslation[key] !== undefined) {
        if ( log === 'verbose') {
          console.info(`[${translated}/${total}] Skipping ${key}`);
        }
        translated++;
        skipped++;
        continue;
      }

      const translation = await translateSentence(value, fileArgs['from'], fileArgs['to']);
      if (translation === null) {
        console.warn(`[${translated}/${total}] Failed to translate ${key}`);
        translated++;
        failed++;
        continue;
      }

      targetTranslation[key] = translation;

      // Log the translation
      if ( log === 'verbose') {
        console.info(`[${translated}/${total}] Translated ${key}: ${translation}`);
      }
      translated++;

      // Add a 1-second timeout
      await new Promise(resolve => setTimeout(resolve, fileArgs['delay'] ?? 500));
    }
  }
}

/**
 * Translate the source file to the target
 * @param fileArgs - The command line arguments for 1 current file
 * @return {Promise<{}>}
 */
export async function translateFile(fileArgs) {

  // Check override flag
  const isOverride = fileArgs['override'];
  const log = fileArgs['log'] ?? 'info';

  // Read the source and target files
  const sourceTranslations = readJson(fileArgs.source);
  const targetTranslation = readJson(fileArgs.dest, !isOverride);

  // Source not found
  if (sourceTranslations === null) {
    return null;
  }

  // Count the number of sentences
  total = calcSentences(sourceTranslations);

  await translateJsonObject(fileArgs, sourceTranslations, targetTranslation);

  // If the target translation is empty, the translation failed
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }

  if ( !log || log !== 'none' ) {
    console.info(`${fileArgs.to}: Translated ${translated} sentences with ${skipped} skipped and ${failed} failed`);
  }

  return targetTranslation;
}
