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
import cheerio from 'cheerio';

import {config} from '../config';
import logger from '../logger';
import request from '../helper/request';

import {loadProcessors} from '../helper';

export default class Worker {
  constructor() {
    this.processors = {};
  }

  main(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    loadProcessors().then((processors) => {
      this.processors = processors;
      this.connect();
    }).catch((err) => {
      logger.error(err);
    });
  }

  connect() {
    amqp.connect(config.amqp.uri, (err, connection) => {
      if (err) {
        logger.error(err);
        return;
      }

      logger.info(`Worker is connected to "${config.amqp.uri}" and waiting for work.`);

      connection.createChannel((error, channel) => {
        if (error) {
          logger.error(error);
          return;
        }

        this.run(channel);
      });
    });
  }

  run(channel) {
    channel.assertQueue(config.amqp.queues.collector, {
      durable: false
    });

    channel.assertQueue(config.amqp.queues.worker, {
      durable: false
    });

    logger.info(`Worker is waiting for work at channel "${config.amqp.queues.collector}"`);
    channel.consume(config.amqp.queues.worker, (data) => {
      const msg = JSON.parse(data.content);
      this.process(channel, msg);
    }, {noAck: true});
  }

  process(channel, msg) {
    const processors = this.processors;

    logger.debug(JSON.stringify(msg, null, 4));

    request(msg.url).then((data) => {
      const doc = cheerio.load(data);

      const processor = processors[msg.processor];
      if (!processor || !processor.processor) {
        logger.warn('Unable to find processor', msg.processor);
        return;
      }

      const res = processor.processor(doc, msg);

      const collect = {
        request: msg,
        result: res
      };

      logger.debug(res);

      const json = JSON.stringify(collect);
      const buffer = Buffer.from(json);
      channel.sendToQueue(config.amqp.queues.collector, buffer);
    }).catch((err) => {
      logger.error(err);
    });
  }
}
