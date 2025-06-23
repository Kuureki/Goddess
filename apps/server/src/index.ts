import { jobs } from './jobs';
import { logger } from './structure/logger';
import { Scheduler } from './structure/scheduler';

export async function main() {
  const scheduler = new Scheduler(jobs);
  await scheduler.start();
}

main().catch((error) => {
  logger.error('An error occurred in the main function:', error);
});
