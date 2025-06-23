import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import type { Browser, Page } from 'puppeteer';

import { puppeteer } from '../lib/puppeteer';

import { logger } from './logger';

export interface PinterestImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

export interface DownloadedImage {
  type: 'main_pin' | 'related_image';
  filepath: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  filename: string;
}

export class PinterestScraper {
  public browser: Browser | null;
  public page: Page | null;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true, // Set to true for headless mode
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();

    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async scrapePinterestPin(url: string) {
    if (!this.page) {
      throw new Error('Browser page is not initialized. Call init() first.');
    }

    try {
      logger.info(`Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const images: PinterestImage[] = [];

      // Get the main pin image
      const main = await this.page.evaluate(() => {
        const selectors = [
          'img[data-test-id="pin-image"]',
          'img[alt*="Pin"]',
          'div[data-test-id="visual-content-container"] img',
          'div[data-test-id="pin-image-container"] img',
          'img[src*="pinimg.com"]',
        ];

        for (const selector of selectors) {
          const img = document.querySelector(selector) as HTMLImageElement;
          if (img && img.src) {
            return {
              src: img.src,
              alt: img.alt || 'Pinterest Pin',
              width: img.naturalWidth,
              height: img.naturalHeight,
            };
          }
        }

        return null;
      });

      if (main) images.push({ ...main, className: '' });

      await this.autoScroll();

      const scraped = await this.page.evaluate(() => {
        const temp: PinterestImage[] = [];
        const imgElements = document.querySelectorAll('img');

        imgElements.forEach((img) => {
          if (
            img.src &&
            (img.src.includes('pinimg.com') || img.src.includes('pinterest') || img.getAttribute('data-test-id'))
          ) {
            // Skip very small images (likely UI elements)
            if (img.naturalWidth > 100 && img.naturalHeight > 100) {
              temp.push({
                src: img.src,
                alt: img.alt || 'Pinterest Image',
                width: img.naturalWidth,
                height: img.naturalHeight,
                className: img.className,
              });
            }
          }
        });

        return temp;
      });

      images.push(...scraped);
      const unique = images.filter((img, index, self) => index === self.findIndex((i) => i.src === img.src));

      logger.info(`Found ${unique.length} total images`);
      return { main, images: unique.filter((i) => i.src !== main?.src), url };
    } catch (error) {
      logger.error('Error scraping Pinterest pin:', error);
      throw error;
    }
  }

  async autoScroll(): Promise<void> {
    if (!this.page) throw new Error('Browser page is not initialized. Call init() first.');

    logger.info('Auto-scrolling to load more content...');

    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(true);
          }
        }, 100);
      });
    });
  }

  async downloadImage(imageUrl: string, filename: string, directory = './pinterest_images'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

      const filepath = path.join(directory, filename);
      const file = fs.createWriteStream(filepath);

      https
        .get(imageUrl, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            logger.info(`Downloaded: ${filename}`);
            resolve(filepath);
          });
        })
        .on('error', (error) => {
          fs.unlink(filepath, () => {}); // Delete the file on error
          reject(error);
        });
    });
  }

  async downloadAllImages(
    data: Awaited<ReturnType<typeof this.scrapePinterestPin>>,
    downloadDirectory = './pinterest_images',
  ) {
    const downloads: DownloadedImage[] = [];

    try {
      // Download main pin image
      if (data.main) {
        const mainFilename = `main_pin_${Date.now()}.jpg`;
        const mainFilepath = await this.downloadImage(data.main.src, mainFilename, downloadDirectory);
        downloads.push({ type: 'main_pin', filepath: mainFilepath, filename: mainFilename, ...data.main });
      }

      // Download all other images
      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i];
        if (!image) return;
        const filename = `image_${i + 1}_${Date.now()}.jpg`;

        try {
          const filepath = await this.downloadImage(image.src, filename, downloadDirectory);
          downloads.push({ type: 'related_image', filepath, filename, ...image });
        } catch (error) {
          logger.error(`Failed to download image ${i + 1}:`, error as unknown);
        }

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      logger.error('Error downloading images:', error);
    }

    return downloads;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
