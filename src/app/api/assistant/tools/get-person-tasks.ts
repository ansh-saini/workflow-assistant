import { Grant } from 'nylas';

import logger from '@/lib/logger';

import { nylas } from '@/app/api/assistant/helpers/nylas';
import { getGrant } from '@/app/api/assistant/tools/get-grant';

interface Props {
  name: string;
}

export const getPersonTasks = async ({ name }: Props) => {
  const user = await getGrant(name);
  const tasks = await getEmailsFromInbox(user);
  return tasks;
};

const getEmailsFromInbox = async (grant: Grant) => {
  logger(`Getting emails for ${grant.email}`);

  const messages = await nylas.messages.list({
    identifier: grant.id,
    queryParams: {
      searchQueryNative: 'tasks',
      limit: 10,
    },
  });

  return messages;
};
