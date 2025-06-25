import { translateSentence } from "./translate-sentence";
import { readJson } from "../disk/read-json";
import { calcSentences } from "../tools/calc-sentences";
import { FileArgs } from "../types";
import * as cliProgress from 'cli-progress';

const cyan = '\x1b[36m';
const reset = '\x1b[0m';

/**
 * JsonTranslator class to handle translation of JSON files
 * using OpenAI's translation capabilities.
 */
export class JsonTranslator {
  private languageIndex = 0;
  private bars: cliProgress.SingleBar[] = [];
  private total = 0;
  private translated = 0;
  private skipped = 0;
  private failed = 0;
  private promptTokens = 0;
  private completionTokens = 0;
  private totalTokens = 0;

  constructor() {}

  public async translate(fileArgs: FileArgs): Promise<Record<string, any> | null> {
    const isOverride = fileArgs.override;
    const sourceTranslations = readJson(fileArgs.source);
    const targetTranslation = readJson(fileArgs.dest, !isOverride);

    if (sourceTranslations === null) return null;

    this.total = calcSentences(sourceTranslations);

    this.bars[this.languageIndex] = new cliProgress.SingleBar({
      format: `${fileArgs.to} |${cyan}{bar}${reset}| {percentage}% || {value}/{total} sentences translated | {skipped} skipped | {failed} failed | Prompt: {promptTokens} | Completion: {completionTokens} | Total tokens: {totalTokens}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.bars[this.languageIndex].start(this.total, 0, {
      skipped: 0,
      failed: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    });

    await this.translateJsonObject(fileArgs, sourceTranslations, targetTranslation);

    this.bars[this.languageIndex].stop();
    this.languageIndex++;

    if (Object.keys(targetTranslation).length !== Object.keys(sourceTranslations).length) {
      console.warn("Some translations failed");
      process.exit(1);
    }

    return targetTranslation;
  }

  /**
   * Recursively translate a JSON object
   * @param fileArgs
   * @param source
   * @param target
   * @private
   */
  private async translateJsonObject(fileArgs: FileArgs, source: Record<string, any>, target: Record<string, any>): Promise<void> {
    const isOverride = fileArgs.override;
    const log = fileArgs.log ?? 'info';

    // Iterate over each key-value pair in the source object
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null) {

        // If the value is an object, recursively translate it
        if (!target[key]) target[key] = {};
        await this.translateJsonObject(fileArgs, value, target[key]);

      } else {

        // If the value is not an object, check if it needs to be translated
        if (!isOverride && target[key] !== undefined) {

          if (log === 'verbose') {
            console.info(`[${this.translated}/${this.total}] Skipping ${key}`);
          }

          this.skipped++;
          this.translated++;

          this.updateProgressBar();

          continue;
        }

        // Translate the value using the translateSentence function
        const translation = await translateSentence(value, fileArgs.to);

        // If the translation fails, log the error and continue
        if (log === 'verbose') {
          console.info(`[${this.translated}/${this.total}] Translated ${key}: ${translation.trans}, Prompt Tokens: ${translation?.usage?.prompt_tokens ?? 0}, Completion Tokens: ${translation?.usage?.completion_tokens ?? 0}, Total Tokens: ${translation?.usage?.total_tokens ?? 0}`);
        }

        // If the translation is empty, log a warning
        if (translation.trans === '') {
          console.warn(`[${this.translated}/${this.total}] Failed to translate ${key}`);
          this.failed++;
        }

        // Update the usage statistics
        this.promptTokens += translation?.usage?.prompt_tokens ?? 0;
        this.completionTokens += translation?.usage?.completion_tokens ?? 0;
        this.totalTokens += translation?.usage?.total_tokens ?? 0;

        // Update the translation statistics
        this.translated++;

        // Update the progress bar with the current translation status
        this.updateProgressBar();

        // Introduce a delay if specified
        await new Promise(resolve => setTimeout(resolve, fileArgs.delay ?? 500));

        // Assign the translated value to the target object
        target[key] = translation.trans;
      }
    }
  }

  /**
   * Update the progress bar with the current translation status
   */
  private updateProgressBar() {
    this.bars[this.languageIndex].update(this.translated, {
      skipped: this.skipped,
      failed: this.failed,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      totalTokens: this.totalTokens
    });
  }

}
