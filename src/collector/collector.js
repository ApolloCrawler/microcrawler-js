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
import crypto from 'crypto';

import {config} from '../config';
import Couchbase from '../couchbase';
import Elasticsearch from '../elasticsearch';

import logger from '../logger';

export default class Collector {
  constructor() {
    this._couchbase = new Couchbase();
    this._elasticsearch = new Elasticsearch();
  }

  get couchbase() {
    return this._couchbase;
  }

  get elasticsearch() {
    return this._elasticsearch;
  }

  main(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    this.couchbase.init().then(() => {
      this.connect();
    }).catch((err) => {
      logger.error(err);
    });
  }

  connect() {
    amqp.connect(config.amqp.uri, config.amqp.options, (err, connection) => {
      if (err) {
        logger.error(err);
        return;
      }

      logger.info(`Collector is connected to "${config.amqp.uri}" and waiting for results.`);

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
      durable: true
    });

    channel.assertQueue(config.amqp.queues.worker, {
      durable: true
    });

    logger.info(`Collector is consuming results at channel "${config.amqp.queues.collector}"`);
    channel.consume(config.amqp.queues.collector, (data) => {
      const msg = JSON.parse(data.content);

      // console.log(JSON.stringify(msg, null, 4));

      let promise = Promise.resolve(true);

      for (let i = 0; i < msg.result.length; i++) {
        const item = msg.result[i];

        if (item.type === 'url') {
          promise = promise.then(() => {
            return this.processUrl(channel, item);
          });
        } else if (item.type === 'data') {
          promise = promise.then(() => {
            return this.processData(channel, msg, item);
          });
        }
      }
    }, {noAck: true});
  }

  processUrl(channel, item) {
    const hash = crypto.createHash('sha256').update(item.url).digest('hex');
    const id = `url-${item.processor}-${hash}`;

    return new Promise((resolve) => {
      this.couchbase.get(id).then((doc) => {
        if (doc) {
          return resolve(doc);
        }

        const msg = {
          processor: item.processor,
          url: item.url
        };

        channel.sendToQueue(config.amqp.queues.worker, Buffer.from(JSON.stringify(msg)), {persistent: true});

        const ts = new Date().toISOString();
        item.createdAt = item.updatedAt = ts;

        resolve(this.couchbase.upsert(id, item));
      });
    });
  }

  processData(channel, msg, item) {
    const hash = crypto.createHash('sha256').update(msg.request.url).digest('hex');
    const id = `data-${msg.request.processor}-${hash}`;

    const ts = new Date().toISOString();
    item.createdAt = item.updatedAt = ts;

    this.elasticsearch.client.index({
      id: id,
      index: config.elasticsearch.index,
      type: 'document',
      body: item
    });

    return this.couchbase.upsert(id, item);
  }
}
