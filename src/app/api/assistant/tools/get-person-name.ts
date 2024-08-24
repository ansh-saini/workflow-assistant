import OpenAI from 'openai';

import logger from '@/lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Props {
  message: string;
}
export const getPersonName = async ({ message }: Props) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          "You are a string parser. You will be given a string that contains a person's name. You have to extract the name from the string. Only return the name and nothing else.",
      },
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.7,
    max_tokens: 64,
    top_p: 1,
  });

  const name = response.choices[0].message.content;
  if (!name) {
    logger('Response: ', JSON.stringify(response));
    throw new Error('Name not found');
  }
  logger(`Got user ${name}`);
  return name;
};
