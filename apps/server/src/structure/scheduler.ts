import { CronJob } from 'cron';
import PQueue from 'p-queue';

export interface Options extends ConstructorParameters<typeof PQueue> {}
export interface QueueOptions extends Options {}

export class Queue extends PQueue {
  public name: string;

  constructor(options: { name: string } & ConstructorParameters<typeof PQueue>[0]) {
    const { name, ...rest } = options;

    // @ts-expect-error - ignore this error
    super(rest);
    this.name = name;
  }
}

export interface Schedule {
  name: string;
  expression: string;
  handler: (scheduler: Scheduler) => unknown | Promise<unknown>;
  queue: {
    options: QueueOptions;
  };
}

export class Scheduler {
  public jobs: Schedule[] = [];
  private queues: Queue[];

  constructor(jobs: Schedule[]) {
    this.jobs = jobs;
    this.queues = jobs.map((job) => new Queue({ name: job.name, ...job.queue.options[0] }));
  }

  public async start() {
    for (const job of this.jobs) {
      const queue = this.queues.find((q) => q.name === job.name);

      if (!queue) {
        throw new Error(`Queue ${job.name} not found`);
      }

      new CronJob(
        job.expression,
        async () => {
          await queue.add(async () => {
            await job.handler(this);
          });
        },
        null,
        true,
      );

      await job.handler(this);
    }
  }
}

export function defineJob(options: Schedule) {
  return options;
}
