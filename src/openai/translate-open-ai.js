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
              text: `Task: Translate "${text}" to language code: "${to}". Response format: Pure JSON {lang: ..., trans: ....}.`
            },
          ]
        }
      ],
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (content) {
      return content.replace(/```json|```/g, ''); // Remove code blocks tags
    }

    // console.log( chatCompletion.usage ); // TODO: Store and display usage
    return {};

  } catch (error) {
    console.error(error);
  }
}
