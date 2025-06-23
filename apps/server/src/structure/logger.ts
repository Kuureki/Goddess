import winston from 'winston';
// import path from 'path';
// import fs from 'fs';

// // Create logs directory if it doesn't exist
// const logsDir = path.join(process.cwd(), 'logs');
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir);
// }

const formats: Record<string, winston.Logform.Format> = {};

formats.color = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const colors = {
      error: '\x1B[31m', // Red
      warn: '\x1B[33m', // Yellow
      info: '\x1B[36m', // Cyan
      debug: '\x1B[35m', // Magenta
      verbose: '\x1B[34m', // Blue
      reset: '\x1B[0m', // Reset
    };

    const color = colors[level as keyof typeof colors] || colors.reset;
    const levelStr = `${color}[${level.toUpperCase()}]${colors.reset}`;
    const timeStr = `\x1B[90m${timestamp}\x1B[0m`; // Gray timestamp

    let logMessage = `${timeStr} ${levelStr} ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n\x1B[90m${JSON.stringify(meta, null, 2)}\x1B[0m`;
    }

    // Add stack trace for errors
    if (stack) {
      logMessage += `\n\x1B[31m${stack}\x1B[0m`;
    }

    return logMessage;
  }),
);

formats.json = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports = [];

transports.push(
  new winston.transports.Console({
    level: 'info',
    format: formats.color,
    handleExceptions: true,
    handleRejections: true,
  }),
);

export const logger = winston.createLogger({
  level: 'info',
  transports,
  exitOnError: false,
});
