import { Grant } from 'nylas';

import logger from '@/lib/logger';

import { nylas } from '@/app/api/assistant/helpers/nylas';
import { getGrant } from '@/app/api/assistant/tools/get-grant';

interface Props {
  name: string;
}

export const getScheduledMeetings = async ({ name }: Props) => {
  const user = await getGrant(name);
  const events = await getUserCalendar(user);

  return events;
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
