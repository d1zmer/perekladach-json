import {translateOpenAi} from "../openai/translate-open-ai";

/**
 * Translate a sentence using OpenAI
 *
 * @param sentence - The sentence to translate
 * @param from - The source language code
 * @param to - The target language code
 * @return {Promise<*|null>}
 */
export async function translateSentence(sentence, from, to) {

  const responseString = await translateOpenAi(sentence, from, to);

  try {
    const responseJson = JSON.parse(responseString);

    const lang = responseJson.lang ?? null;
    const translation = responseJson.trans ?? null;

    if (lang === to && translation !== null){
      return translation;
    }
  } catch (error) {
    console.error(error);
  }

  return null;

}
