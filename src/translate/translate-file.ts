import {translateSentence} from "./translate-sentence";
import {readJson} from "../disk/read-json";
import {calcSentences} from "../tools/calc-sentences";
import {FileArgs} from "../types";
import * as cliProgress from 'cli-progress';
// import * as colors from 'ansi-colors';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

let languageIndex = 0;
let bars: cliProgress.SingleBar[] = [];
let total = 0;
let translated = 0;
let skipped = 0;
let failed = 0;

let promptTokens = 0;
let completionTokens = 0;
let totalTokens = 0;

/**
 * Recursively translate the JSON object
 * @param fileArgs
 * @param sourceTranslations
 * @param targetTranslation
 * @return {Promise<void>}
 */
async function translateJsonObject(fileArgs: FileArgs, sourceTranslations: Record<string, any>, targetTranslation: Record<string, any>): Promise<void> {

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
        if (log === 'verbose') {
          console.info(`[${translated}/${total}] Skipping ${key}`);
        }
        translated++;
        skipped++;
        continue;
      }

      // Translate the sentence
      const translation = await translateSentence(value, fileArgs['to']);

      // Log the translation
      if (log === 'verbose') {
        console.info(`[${translated}/${total}] Translated ${key}: ${translation.trans}, Prompt Tokens: ${translation?.usage?.prompt_tokens ?? 0}, Completion Tokens: ${translation?.usage?.completion_tokens ?? 0}, Total Tokens: ${translation?.usage?.total_tokens ?? 0}`);
      }

      // If the translation failed, log a warning
      if (translation.trans === '') {
        console.warn(`[${translated}/${total}] Failed to translate ${key}`);
        failed++;
      }

      // If the translation is empty, skip it
      translated++;
      promptTokens = translation?.usage?.prompt_tokens ?? 0;
      completionTokens += translation?.usage?.completion_tokens ?? 0;
      totalTokens += translation?.usage?.total_tokens ?? 0;

      // Update the progress bar
      bars[languageIndex].update(
        translated,
        {
          skipped: skipped,
          failed: failed,
          promptTokens: translation?.usage?.prompt_tokens ?? 0,
          completionTokens: translation?.usage?.completion_tokens ?? 0,
          totalTokens: translation?.usage?.total_tokens ?? 0
        }
      );

      await new Promise(resolve => setTimeout(resolve, fileArgs['delay'] ?? 500));
    }
  }
}

/**
 * Translate the source file to the target
 * @param fileArgs - The command line arguments for 1 current file
 * @return {Promise<{}>}
 */
export async function translateFile(fileArgs: FileArgs): Promise<Record<string, any> | null> {

  // Check override flag
  const isOverride = fileArgs['override'];

  // Read the source and target files
  const sourceTranslations = readJson(fileArgs.source);
  const targetTranslation = readJson(fileArgs.dest, !isOverride);

  // Source not found
  if (sourceTranslations === null) {
    return null;
  }

  // Count the number of sentences
  total = calcSentences(sourceTranslations);

  // Visualize the progress
  bars[languageIndex] = new cliProgress.SingleBar(
    {
      format: `${fileArgs['to']} |${cyan}{bar}${reset}| {percentage}% || {value}/{total} sentences translated | {skipped} skipped | {failed} failed | Prompt: {promptTokens} | Completion: {completionTokens} | Total: {totalTokens}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    }
  );
  bars[languageIndex].start(
    total, 0,
    {
      skipped: 0,
      failed: 0
    }
  );

  await translateJsonObject(fileArgs, sourceTranslations, targetTranslation);

  // If the target translation is empty, the translation failed
  if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
    console.warn("Some translations failed");
    process.exit(1);
  }

  // Stop the progress bar
  bars[languageIndex].stop();
  languageIndex++;

  return targetTranslation;
}
