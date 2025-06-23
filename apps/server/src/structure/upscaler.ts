import waifu2x from 'waifu2x';

import { logger } from './logger';

export interface UpscaleOptions {
  inputFilePath: string;
  outputFilePath?: string;
}

export class DeepAIUpscaler {
  async upscaleImage(options: UpscaleOptions): Promise<string> {
    try {
      const { inputFilePath, outputFilePath } = options;
      const upscaledImage = await waifu2x.upscaleImage(inputFilePath, outputFilePath, { noise: 2, scale: 2.0 });

      return upscaledImage;
    } catch (error) {
      logger.error('Error during upscaling process:', error);
      throw error;
    }
  }
}
