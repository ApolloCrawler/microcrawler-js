import pkg from '../../package.json';
import program from 'commander';

import amqp from 'amqplib/callback_api';
import cheerio from 'cheerio';
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

      const fn = processors[msg.processor];
      if (!fn) {
        console.log('Unable to find processor', msg.processor);
        return;
      }

      const res = fn(doc, msg);

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

    this.registerProcessor(name, require(fullPath));

    return {
      name: name,
      path: fullPath,
      processor: require(fullPath)
    };
  }

  loadProcessors(pathDir) {
    return new Promise((resolve, reject) => {
      walk(pathDir, (err, results) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const processors = [];

        for (let i = 0; i < results.length; i++) {
          const fullPath = results[i];
          const proc = this.loadProcessor(pathDir, fullPath);
          processors.push(proc);
        }

        resolve(processors);
      });
    });
  }

  registerProcessor(name, processor) {
    if (!name) {
      throw new TypeError('name must be specified');
    }

    this.processors[name] = processor.default;
    return processor;
  }
}
