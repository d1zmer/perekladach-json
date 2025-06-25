import OpenAI from 'openai';
import dotenv from 'dotenv';
import {CompletionUsage} from "openai/resources/completions";
import {Translation} from "../types";

dotenv.config();

const openAiClient = new OpenAI({apiKey:process.env.PEREKLADACH_OPENAI_API_KEY});

/**
 * Translate text using OpenAI's GPT-4o-mini model
 * @param text - The text to translate
 * @param to - The target language code
 * @return {Promise<Translation>} - The translation result in JSON format
 */
export const translateOpenAi = async (text: string, to: string ): Promise<Translation> => {

  let usage: CompletionUsage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  };

  try {
    const chatCompletion = await openAiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Task: Translate "${text}" to language code: "${to}". Response format: Pure JSON {lang: ..., trans: ....}.`
            },
          ]
        }
      ],
    });

    // Check if the response contains choices and content
    let contentObject: { lang?: string, trans?: string} = {};
    const content = chatCompletion.choices[0]?.message?.content;
    if (content) {

      // Remove code block markers and parse the JSON content
      let cleanContent = content.replace(/```json|```/g, '');
      contentObject = JSON.parse(cleanContent);

      // Ensure the content has the expected structure
      if (!contentObject.lang || !contentObject.trans) {
        console.warn('Unexpected response format:', contentObject);
      }

      // Validate the language code
      if (contentObject.lang && !/^[a-z]{2,3}(-[A-Z]{2})?$/.test(contentObject.lang)) {
        console.warn(`Invalid language code: ${contentObject.lang}`);
      }

    }

    return {
      ...contentObject,
      usage: chatCompletion.usage
    };

  } catch (error) {
    console.error(error);
    return {
      lang: to,
      trans: text,
      usage: usage
    };
  }

}
