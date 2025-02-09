import {translateSentence} from "./translate-sentence";
import {readJson} from "../disk/read-json";

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
        console.info(`Skipping ${key}`);
        continue;
      }

      const translation = await translateSentence(value, args);
      if (translation === null) {
        console.warn(`Failed to translate ${key}`);
        continue;
      }

      targetTranslation[key] = translation;

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
  const sourceTranslations = readJson(args.source);
  const targetTranslation = readJson(args.target, true);

  const isOverride = (args['override'] ?? 'false') === 'true';

  await translateJsonObject(sourceTranslations, args, targetTranslation, isOverride);

  // If the target translation is empty, the translation failed
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }

  return targetTranslation;
}
