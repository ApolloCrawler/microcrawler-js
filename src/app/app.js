import pkg from '../../package.json';
import program from 'commander';

import amqp from 'amqplib/callback_api';

import config from '../../config';

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

    const url = args[2];
    const processor = args[3];

    amqp.connect(config.amqp.uri, (err, connection) => {
      if (err) {
        console.log(err);
        return;
      }

      connection.createChannel((err, channel) => {
        if (err) {
          console.log(err);
          return;
        }

        channel.assertQueue(config.amqp.queues.worker, {
          durable: false
        });

        const msg = {
          url,
          processor
        };

        console.log(`Initializing crawling of '${url}' using '${processor}' processor.`);

        // channel.sendToQueue(config.amqp.queues.worker, Buffer.from(JSON.stringify(msg)));

        process.exit(0);
      });
    });
  }
}

