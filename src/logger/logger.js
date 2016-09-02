import os from 'os';
import winston from 'winston';

const logPath = '~/.microcrawler/log.txt'.replace('~', os.homedir());

const logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: logPath,
      handleExceptions: true,
      json: false,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
      timestamp: true
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: true
    })
  ],
  exitOnError: false
});

export default logger;
