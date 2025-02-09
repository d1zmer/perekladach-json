import {translateSentence} from "./translate-sentence";
import {readJson} from "./read-json";

/**
 * Translate the source file to the target
 * @param args
 * @return {Promise<{}>}
 */
export async function translateFile(args) {

  const sourceTranslations = readJson(args.source);
  const targetTranslation = readJson(args.target, true);

  const isOverride = args['override'] ?? false;
  const translationPromises = Object.entries(sourceTranslations).map(async ([key, value]) => {

    // If the key is already in the target translation and override is false, skip
    if (!isOverride && targetTranslation[key] !== undefined) {
      console.info(`Skipping ${key}`);
      return;
    }

    const translation = await translateSentence(value, args);
    if (translation === null) {
      console.warn(`Failed to translate ${key}`);
      return;
    }

    // Add the translation to the target translation
    targetTranslation[key] = translation;

  });

  await Promise.all(translationPromises);
  return targetTranslation;
}
