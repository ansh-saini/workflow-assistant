import { openai } from '@ai-sdk/openai';
import { openai as OpenAICore } from '@/app/api/assistant/helpers/openai';
import { convertToCoreMessages, generateText, streamText } from 'ai';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { z } from 'zod';

import {
  getEmployee,
  listEmployees,
} from '@/app/api/assistant/tools/employees';
import { getPersonAvailability } from '@/app/api/assistant/tools/get-person-availability';
import { getPersonName } from '@/app/api/assistant/tools/get-person-name';
import { getPersonTasks } from '@/app/api/assistant/tools/get-person-tasks';
import { getScheduledMeetings } from '@/app/api/assistant/tools/get-scheduled-meetings';
import { createLeave, getLeaves } from '@/app/api/assistant/tools/leaves';
import { scheduleMeeting } from '@/app/api/assistant/tools/schedule-meeting';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const channel = url.searchParams.get('channel');

  const isWhatsapp = channel === 'whatsapp';

  if (isWhatsapp) {
    let textResult = '';

    const body = await req.text();
    const message = new URLSearchParams(body).get('Body');

    if (!message) return new Response('message is required', { status: 404 });

    const startingMessages = convertToCoreMessages([
      {
        role: 'system',
        content: `The user's name is Namita.`,
      },
      {
        role: 'system',
        content: `Today's date is ${new Date().toLocaleDateString()}. Use this date to compare with the leave dates, when the user asks you for who's on leave`,
      },
      {
        role: 'system',
        content: `When you're asked to tell the schedule for the day, include user's calendar events and tasks`,
      },
      {
        role: 'system',
        content: `DO NOT USE Markdown in the messages. Use plain text.`,
      },
      {
        role: 'assistant',
        content: `### Hello! I'm WorkFlow! 🌟

Hope you're having a fantastic day! 😊 How can I assist you today?

### You can ask me things like:

📅 What does my day look like?

📆 When's my next meeting?

🤝 When is Priyanka available for a meeting?

👥 How many employees do we have?

🌴 Who's on leave today?

And guess what? I can also schedule meetings for you! 🗓️`,
      },
      {
        role: 'user',
        content: message,
      },
    ]);

    while (!textResult) {
      console.log('Running Again');
      const result = await generateText({
        model: openai('gpt-4-turbo'),
        messages: startingMessages,
        tools,
      });

      if (result.toolResults.length > 0 && result.toolCalls.length > 0) {
        startingMessages.push({
          role: 'assistant' as const,
          content: result.toolCalls,
        });

        startingMessages.push({
          role: 'tool' as const,
          content: result.toolResults,
        });
      } else {
        textResult = result.text;
      }
    }

    console.log(textResult);
    const twiml = new MessagingResponse();
    twiml.message(textResult);

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
  getEmployeeLeaves: {
    description:
      'Get upcoming leaves of all employees. `leaveDate` is the date of the leave and `employee` is the employee who is taking the leave.',
    parameters: z.object({}),
    execute: getLeaves,
  },
  createEmployeeLeaves: {
    description: 'Create a leave for an employee.',
    parameters: z.object({
      name: z.string().describe('employee name'),
      date: z.string().describe('leave date in format: yyyy-mm-dd'),
    }),
    execute: createLeave,
  },
  getEmployeeInformation: {
    description: 'Get information about an employee.',
    parameters: z.object({
      name: z.string().describe('employee name'),
    }),
    execute: getEmployee,
  },
  listAllEmployees: {
    description: 'List all employees.',
    parameters: z.object({}),
    execute: listEmployees,
  },
};
