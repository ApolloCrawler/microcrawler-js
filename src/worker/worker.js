import pkg from '../../package.json';
import program from 'commander';

import amqp from 'amqplib/callback_api';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import config from '../../config';
import request from '../helper/request';
import walk from '../helper/walk';

export default class Worker {
  constructor(args) {
    this.processors = {};
  }

  main(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    const processorsPath = path.join(__dirname, '..', '..', 'examples');
    this.loadProcessors(processorsPath).then((processors) => {
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

  loadProcessor(pathDir, fullPath) {
    const name = path.relative(pathDir, fullPath)
      .replace(path.extname(fullPath), '')
      .replace(path.sep, '.');

    const processor = require(fullPath);
    this.registerProcessor(name, processor);

    return {
      name: name,
      path: fullPath,
      processor: processor
    };
  }

  loadProcessors(pathDir) {
    return new Promise((resolve, reject) => {
      const dir = path.join(__dirname, '..', '..', 'node_modules');
      fs.readdir(dir, (err, items) => {
        if (err) {
          return reject(err);
        }

        let res = {};

        const prefix = 'microcrawler-crawler-';
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.indexOf(prefix) != 0) {
            continue;
          }

          const name = item.replace(prefix, '');
          const pkg = require(`${item}/package.json`);

          const crawler = pkg.crawler || {};
          const processors = crawler.processors || {};
          const processorNames = Object.keys(processors);
          for (let j = 0; j < processorNames.length; j++) {
            const processorName = processorNames[j];
            const processorPath = path.join(dir, item, processors[processorName]);
            const processor = require(processorPath);

            const fullName = `${name}.${processorName}`;
            res[fullName] = {
              crawler: name,
              name: processorName,
              fullName,
              path: processorPath,
              processor,
              meta: pkg.crawler
            };
          }
        }

        resolve(res);
      });
    });
  }

  registerProcessor(name, processor) {
    if (!name) {
      throw new TypeError('name must be specified');
    }

    this.processors[name] = processor;
    return processor;
  }
}
