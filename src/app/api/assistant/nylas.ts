import Nylas from "nylas";

const NylasConfig = {
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: 'https://api.us.nylas.com',
};

export const nylas = new Nylas(NylasConfig)