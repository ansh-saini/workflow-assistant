import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';

import { getPersonName } from '@/app/api/assistant-v2/tools/get-person-name';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: convertToCoreMessages(messages),
    tools: {
      // server-side tool with execute function:
      getPersonName: {
        description: "Parse the string to extract the user's name.",
        parameters: z.object({
          message: z
            .string()
            .describe('The message from which to extract the name.'),
        }),
        execute: getPersonName,
      },
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getLocation: {
        description:
          'Get the user location. Always ask for confirmation before using this tool.',
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = await streamText({
//     model: openai('gpt-4-turbo'),
//     messages: convertToCoreMessages(messages),
//     tools: {
//       // server-side tool with execute function:
//       getWeatherInformation: {
//         description: 'show the weather in a given city to the user',
//         parameters: z.object({ city: z.string() }),
//         // eslint-disable-next-line no-empty-pattern
//         execute: async ({}: { city: string }) => {
//           const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
//           return weatherOptions[
//             Math.floor(Math.random() * weatherOptions.length)
//           ];
//         },
//       },
//       // client-side tool that starts user interaction:
//       askForConfirmation: {
//         description: 'Ask the user for confirmation.',
//         parameters: z.object({
//           message: z.string().describe('The message to ask for confirmation.'),
//         }),
//       },
//       // client-side tool that is automatically executed on the client:
//       getLocation: {
//         description:
//           'Get the user location. Always ask for confirmation before using this tool.',
//         parameters: z.object({}),
//       },
//     },
//   });

//   return result.toDataStreamResponse();
// }
