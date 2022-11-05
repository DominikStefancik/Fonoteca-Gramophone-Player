import { pino } from 'pino';

export const getLogger = (name: string): pino.Logger => {
  return pino({
    name,
  });
};
