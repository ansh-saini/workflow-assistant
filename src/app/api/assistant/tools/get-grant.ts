import { nylas } from '@/app/api/assistant/helpers/nylas';
import logger from '@/lib/logger';

export const getGrant = async (name: string) => {
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
