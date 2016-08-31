import pkg from '../../package.json';
import program from 'commander';

import amqp from 'amqplib/callback_api';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import config from '../../config';
import request from '../helper/request';
import walk from '../helper/walk';

import {loadProcessors} from '../helper';

export default class Worker {
  constructor(args) {
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
      console.log(err);
    });
  }

  connect() {
    amqp.connect(config.amqp.uri, (err, connection) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Worker is connected to "${config.amqp.uri}" and waiting for work.`);

      connection.createChannel((err, channel) => {
        if (err) {
          console.log(err);
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

    channel.consume(config.amqp.queues.worker, (data) => {
      const msg = JSON.parse(data.content);
      this.process(channel, msg);
    }, {noAck: true});
  }

  process(channel, msg) {
    const processors = this.processors;

    console.log(JSON.stringify(msg, null, 4));

    request(msg.url).then((data) => {
      const doc = cheerio.load(data);

      const processor = processors[msg.processor];
      if (!processor || !processor.processor) {
        console.log('Unable to find processor', msg.processor);
        return;
      }

      const res = processor.processor(doc, msg);

      const collect = {
        request: msg,
        result: res
      }

      console.log(res);

      const json = JSON.stringify(collect);
      const buffer = Buffer.from(json);
      channel.sendToQueue(config.amqp.queues.collector, buffer);
    }).catch((err) => {
      console.log(err);
    });
  }
}
