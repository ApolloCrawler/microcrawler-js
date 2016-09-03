// Copyright, 2013-2016, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
