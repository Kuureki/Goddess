import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { logger } from '../structure/logger';
import { PinterestScraper } from '../structure/pinterest';
import { defineJob } from '../structure/scheduler';
import { DeepAIUpscaler } from '../structure/upscaler';

export default defineJob({
  expression: '0 0 * * *', // Every day at midnight,
  handler: async ({ jobs }) => {
    const client = new PinterestScraper();
    const upscaler = new DeepAIUpscaler();

    const paths = {
      scraped: path.join(process.cwd(), 'public', 'images', 'scraped'),
      upscaled: path.join(process.cwd(), 'public', 'images', 'upscaled'),
    };

    fs.existsSync(paths.scraped) || fs.mkdirSync(paths.scraped);
    fs.existsSync(paths.upscaled) || fs.mkdirSync(paths.upscaled);

    await client.init();

    const ID = '370491506866049844';

    try {
      const scraped = await client.scrapePinterestPin(`https://www.pinterest.com/pin/${ID}`);
      const images = await client.downloadAllImages(scraped, paths.scraped);
      if (!images) return;

      for await (const image of images) {
        await upscaler.upscaleImage({ inputFilePath: image.filepath, outputFilePath: paths.upscaled });
      }
    } catch (error) {
      logger.error('Error:', error);
    }
  },
  name: 'Pinterest Scraper',
  queue: {
    options: [
      {
        concurrency: 1,
      },
    ],
  },
});
