import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(AdblockerPlugin({ interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY }));
puppeteer.use(StealthPlugin());

export { puppeteer };
