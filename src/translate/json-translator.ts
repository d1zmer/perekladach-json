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
      format: `${fileArgs.to} |${cyan}{bar}${reset}| {percentage}% || {value}/{total} sentences translated | {skipped} skipped | {failed} failed | Prompt: {promptTokens} | Completion: {completionTokens} | Total: {totalTokens}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.bars[this.languageIndex].start(this.total, 0, {
      skipped: 0,
      failed: 0
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

  private async translateJsonObject(fileArgs: FileArgs, source: Record<string, any>, target: Record<string, any>): Promise<void> {
    const isOverride = fileArgs.override;
    const log = fileArgs.log ?? 'info';

    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null) {
        if (!target[key]) target[key] = {};
        await this.translateJsonObject(fileArgs, value, target[key]);
      } else {
        if (!isOverride && target[key] !== undefined) {
          if (log === 'verbose') {
            console.info(`[${this.translated}/${this.total}] Skipping ${key}`);
          }
          this.translated++;
          this.skipped++;
          continue;
        }

        const translation = await translateSentence(value, fileArgs.to);

        if (log === 'verbose') {
          console.info(`[${this.translated}/${this.total}] Translated ${key}: ${translation.trans}, Prompt Tokens: ${translation?.usage?.prompt_tokens ?? 0}, Completion Tokens: ${translation?.usage?.completion_tokens ?? 0}, Total Tokens: ${translation?.usage?.total_tokens ?? 0}`);
        }

        if (translation.trans === '') {
          console.warn(`[${this.translated}/${this.total}] Failed to translate ${key}`);
          this.failed++;
        }

        this.translated++;
        this.promptTokens += translation?.usage?.prompt_tokens ?? 0;
        this.completionTokens += translation?.usage?.completion_tokens ?? 0;
        this.totalTokens += translation?.usage?.total_tokens ?? 0;

        this.bars[this.languageIndex].update(this.translated, {
          skipped: this.skipped,
          failed: this.failed,
          promptTokens: this.promptTokens,
          completionTokens: this.completionTokens,
          totalTokens: this.totalTokens
        });

        await new Promise(resolve => setTimeout(resolve, fileArgs.delay ?? 500));

        target[key] = translation.trans;
      }
    }
  }
}
