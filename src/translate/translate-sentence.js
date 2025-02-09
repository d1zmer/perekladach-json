import {translateOpenAi} from "../openai/translate-open-ai";

export async function translateSentence(sentence, args) {

  const responseString = await translateOpenAi(sentence, args['from'], args['to']);

  try {
    const responseJson = JSON.parse(responseString);

    const lang = responseJson.lang ?? null;
    const translation = responseJson.trans ?? null;

    if (lang === args['to'] && translation !== null){
      return translation;
    }
  } catch (error) {
    console.error(error);
  }

  return null;

}
