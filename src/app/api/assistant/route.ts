import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, generateText, streamText } from 'ai';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { z } from 'zod';

import { getPersonAvailability } from '@/app/api/assistant/tools/get-person-availability';
import { getPersonName } from '@/app/api/assistant/tools/get-person-name';
import { getPersonTasks } from '@/app/api/assistant/tools/get-person-tasks';
import { scheduleMeeting } from '@/app/api/assistant/tools/schedule-meeting';
import { getScheduledMeetings } from '@/app/api/assistant/tools/get-scheduled-meetings';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const channel = url.searchParams.get('channel');

  const isWhatsapp = channel === 'whatsapp';

  if (isWhatsapp) {
    const body = await req.text();
    const message = new URLSearchParams(body).get('Body');

    if (!message) return new Response('message is required', { status: 404 });

    const result = await generateText({
      model: openai('gpt-4-turbo'),
      messages: convertToCoreMessages([
        {
          role: 'user',
          content: message,
        },
      ]),
      tools,
    });

    const twiml = new MessagingResponse();
    twiml.message(result.text);

    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: convertToCoreMessages(messages),
    tools,
  });

  return result.toDataStreamResponse();
}

const tools = {
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
    description:
      "Find the user's availability for a meeting. These are the available time slots. They are NOT the slots on which the user has events.",
    parameters: z.object({
      name: z.string().describe('user name'),
    }),
    execute: getPersonAvailability,
  },
  getScheduledMeetings: {
    description: "Get the user's scheduled meetings.",
    parameters: z.object({
      name: z.string().describe('user name'),
    }),
    execute: getScheduledMeetings,
  },
  getPersonTasks: {
    description: "Get the user's tasks.",
    parameters: z.object({
      name: z.string().describe('user name'),
    }),
    execute: getPersonTasks,
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
};
