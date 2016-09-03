import pkg from '../../package.json';
import program from 'commander';

import amqp from 'amqplib/callback_api';

import {config} from '../config';
import logger from '../logger';

export default class App {
  main(args = process.argv) {
    program
      .version(pkg.version)
      .command('collector [args]', 'Run data collector')
      .command('config [args]', 'Run config')
      .command('exporter [args]', 'Run data exporter')
      .command('worker [args]', 'Run crawler worker')
      .command('crawl [args]', 'Crawl specified site')
      .parse(args);
  }

  crawl(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    const processor = args[2];
    const url = args[3];

    amqp.connect(config.amqp.uri, (err, connection) => {
      if (err) {
        logger.error(err);
        return;
      }

      connection.createChannel((error, channel) => {
        if (error) {
          logger.error(error);
          return;
        }

        channel.assertQueue(config.amqp.queues.worker, {
          durable: false
        });

        const msg = {
          url: url,
          processor: processor
        };

        logger.info(`Initializing crawling of '${url}' using '${processor}' processor.`);

        const res = channel.sendToQueue(config.amqp.queues.worker, Buffer.from(JSON.stringify(msg)));
        logger.debug(res);

        setTimeout(() => {
          process.exit(0);
        }, 1000);
      });
    });
  }
}
