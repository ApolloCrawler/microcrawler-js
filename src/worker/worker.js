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
