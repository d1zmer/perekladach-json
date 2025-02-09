import {translateSentence} from "./translate-sentence";
import {readJson} from "../disk/read-json";

/**
 * Translate the source file to the target
 * @param args
 * @return {Promise<{}>}
 */
export async function translateFile(args) {
  const sourceTranslations = readJson(args.source);
  const targetTranslation = readJson(args.target, true);

  const isOverride = (args['override'] ?? 'false') === 'true';

  for (const [key, value] of Object.entries(sourceTranslations)) {

    // If the key is already in the target translation and override is false, skip
    if (!isOverride && targetTranslation[key] !== undefined) {
      console.info(`Skipping ${key}`);
      continue;
    }

    const translation = await translateSentence(value, args);
    if (translation === null) {
      console.warn(`Failed to translate ${key}`);
      continue;
    }

    // Add the translation to the target translation
    targetTranslation[key] = translation;

    // Add a 1-second timeout
    await new Promise(resolve => setTimeout(resolve, args['timeout'] ?? 1000));

  }

  // If the target translation is empty, the translation failed
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }

  return targetTranslation;
}
