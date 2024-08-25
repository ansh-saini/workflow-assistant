import { Grant } from 'nylas';

import logger from '@/lib/logger';

import { nylas } from '@/app/api/assistant/helpers/nylas';

interface Props {
  invitee: string;
  host: string;
  startTime: string;
  endTime: string;
}

const getTime = (time: string) => {
  const isPM = time.toLowerCase().includes('pm');
  const isAM = time.toLowerCase().includes('am');

  if (isPM || isAM) {
    time = time.replace(/am|pm/gi, '');
  }

  const chunks = time.split(':').map(Number);
  let hours = chunks[0];
  const minutes = chunks[1];

  if (isPM && hours < 12) {
    hours = hours + 12;
  }

  const today = new Date();

  const date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes
  );

  return Math.floor(date.getTime() / 1000);
};

export const scheduleMeeting = async (props: Props) => {
  const startTime = getTime(props.startTime);
  const endTime = getTime(props.endTime);

  const host = await getGrant(props.host);
  const invitee = await getGrant(props.invitee);

  const hostCalendarId = await getUserCalendar(host);

  const event = await createEvent({
    host,
    invitee,
    startTime,
    endTime,
    calendarId: hostCalendarId,
  });

  return event;
};

const getGrant = async (name: string) => {
  logger(`Getting Grant for ${name}`);
  const grants = await nylas.grants.list();
  const grant = grants.data.find((grant) =>
    grant.email?.includes(name.toLowerCase())
  );

  if (!grant) {
    throw new Error('Grant not found');
  }
  logger(grant, 'Got Grant');
  return grant;
};

const getUserCalendar = async (grant: Grant) => {
  logger(`Getting calendar for ${grant.email}`);

  const calendars = await nylas.calendars.list({
    identifier: grant.id,
  });
  const primaryCalendar = calendars.data.find((calendar) => calendar.isPrimary);

  if (!primaryCalendar) {
    throw new Error('This person does not have a calendar');
  }

  return primaryCalendar.id;
};

type Config = {
  invitee: Grant;
  host: Grant;
  startTime: number;
  endTime: number;
  calendarId: string;
};
async function createEvent({
  invitee,
  endTime,
  startTime,
  host,
  calendarId,
}: Config) {
  try {
    const event = await nylas.events.create({
      identifier: host.id,
      requestBody: {
        title: 'Meeting',
        when: {
          startTime,
          endTime,
        },
        participants: [
          {
            status: 'yes',
            email: invitee.email!,
          },
        ],
      },
      queryParams: {
        calendarId,
      },
    });

    console.log('Event:', event);
  } catch (error) {
    console.error('Error creating event:', error);
  }
}
