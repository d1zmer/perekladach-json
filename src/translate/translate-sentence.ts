import {translateOpenAi} from "../openai/translate-open-ai";
import {Translation} from "../types";

/**
 * Translate a sentence using OpenAI
 *
 * @param sentence - The sentence to translate
 * @param to - The target language code
 * @return {Promise<Translation>} - The translation results
 */
export async function translateSentence(sentence: string, to: string): Promise<Translation> {

  return await translateOpenAi(sentence, to);

}
