import { Event, Grant, WhenType } from 'nylas';

import logger from '@/lib/logger';

import { nylas } from '@/app/api/assistant/helpers/nylas';
import { openai } from '@/app/api/assistant/helpers/openai';
import { getGrant } from '@/app/api/assistant/tools/get-grant';

const companyWorkingHours = '10am to 6pm';

interface Props {
  name: string;
}

export const getPersonAvailability = async ({ name }: Props) => {
  const user = await getGrant(name);

  const events = await getUserCalendar(user);

  const availableSlots = getThreeAvailableTimeSlots(events);

  return availableSlots;
};

const getUserCalendar = async (grant: Grant) => {
  logger(`Getting calendar for ${grant.email}`);

  const now = Math.floor(Date.now() / 1000);

  const calendars = await nylas.calendars.list({
    identifier: grant.id,
  });
  const primaryCalendar = calendars.data.find((calendar) => calendar.isPrimary);

  if (!primaryCalendar) {
    throw new Error('This person does not have a calendar');
  }

  const events = await nylas.events.list({
    identifier: grant.id,
    queryParams: {
      calendarId: primaryCalendar?.id,
      start: now.toString(),
      // Fetching events for the next 7 days
      end: (now + 3600 * 24 * 7).toString(),
    },
  });

  return events.data;
};

const getThreeAvailableTimeSlots = async (events: Event[]) => {
  logger(`Checking availability`);

  const bookedSlots = events.map((event) => {
    const { when } = event;

    switch (when.object) {
      case WhenType.Date:
        return {
          start: new Date(when.date),
          end: null,
        };
      case WhenType.Datespan:
        return {
          start: new Date(when.startDate),
          end: new Date(when.endDate),
        };
      case WhenType.Time:
        return {
          start: new Date(when.time * 1000),
          end: null,
        };
      case WhenType.Timespan:
        return {
          start: new Date(when.startTime * 1000),
          end: new Date(when.endTime * 1000),
        };
    }
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an availability checker. You will be given a array of events in a JSON format containing start and end times in ISO format. Those are the already booked slots.
You have to find at most three suitable time slots for a meeting. The slots must be within the company's working hours.
Prefer the slots that are closer to the current time. If there are no available slots, return "No available slots".
`,
      },
      {
        role: 'system',
        content: `Company working hours: ${companyWorkingHours}
Company working days: Monday to Friday
Try to Avoid meetings during lunch hours (1pm to 2pm)`,
      },
      {
        role: 'system',
        content: `Format the output in a human read-able way.
Output format examples: ["10:00AM to 11:00AM", "2:00PM to 3:00PM", "4:00PM to 5:00PM"]`,
      },
      {
        role: 'user',
        content: JSON.stringify(bookedSlots),
      },
    ],
    temperature: 0.7,
    max_tokens: 64,
    top_p: 1,
  });

  const slots = response.choices[0].message.content;
  if (!slots) {
    logger(JSON.stringify(response), 'Slots response');
    throw new Error('Slots not available');
  }
  logger(`Got user ${slots}`);
  return slots;
};
