import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openAiClient = new OpenAI({apiKey:process.env.PEREKLADACH_OPENAI_API_KEY});

export const translateOpenAi = async (text, from, to ) => {

  try {
    const chatCompletion = await openAiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Task: Translate to language code: "${to}".`
            },
            {
              type: 'text',
              text: `Format: Pure JSON without md {lang: ..., trans: ....}.`
            },
            {
              type: 'text',
              text: text
            }
          ]
        }
      ],
    });

    // console.log( chatCompletion.usage ); // TODO: Store and display usage
    return chatCompletion.choices[0]?.message?.content ?? {};

  } catch (error) {
    console.error(error);
  }
}
