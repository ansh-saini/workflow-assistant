import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';

import { getPersonAvailability } from '@/app/api/assistant/tools/get-person-availability';
import { getPersonName } from '@/app/api/assistant/tools/get-person-name';
import { scheduleMeeting } from '@/app/api/assistant/tools/schedule-meeting';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: convertToCoreMessages(messages),
    tools: {
      getPersonName: {
        description: "Parse the string to extract the user's name.",
        parameters: z.object({
          message: z
            .string()
            .describe('The message from which to extract the name.'),
        }),
        execute: getPersonName,
      },
      getPersonAvailability: {
        description: "Find the user's availability for a meeting.",
        parameters: z.object({
          name: z.string().describe('user name'),
        }),
        execute: getPersonAvailability,
      },
      scheduleMeeting: {
        description: 'Schedule a meeting with the user.',
        parameters: z.object({
          host: z.string().describe('meeting host name'),
          invitee: z.string().describe('meeting invitee name'),
          startTime: z.string().describe('meeting start time in format: '),
          endTime: z.string().describe('meeting end time in format: '),
        }),
        execute: scheduleMeeting,
      },
    },
  });

  return result.toDataStreamResponse();
}
