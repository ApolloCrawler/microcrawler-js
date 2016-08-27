import amqp from 'amqplib/callback_api';
import crypto from 'crypto';

import config from '../../config';
import Couchbase from '../couchbase';
import Elasticsearch from '../elasticsearch';

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

  main() {
    this.couchbase.init().then(() => {
      this.connect();
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

    channel.consume(config.amqp.queues.collector, (data) => {
      const msg = JSON.parse(data.content);
      console.log(JSON.stringify(msg, null, 4));

      let promise = Promise.resolve(true);

      for (var i = 0; i < msg.result.length; i++) {
        const item = msg.result[i];

        if (item.type == 'url') {
          promise = promise.then(() => {
            return this.processUrl(channel, item);
          });
        } else if (item.type == 'data') {
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

    return new Promise((resolve, reject) => {
      this.couchbase.get(id).then((doc) => {
        if (doc) {
          return resolve(doc);
        }

        const msg = {
          processor: item.processor,
          url: item.url
        };

        channel.sendToQueue(config.amqp.queues.worker, Buffer.from(JSON.stringify(msg)));

        var ts = new Date().toISOString();
        item['createdAt'] = ts;
        item['updatedAt'] = ts;

        resolve(this.couchbase.upsert(id, item));
      });
    });
  }

  processData(channel, msg, item) {
    const hash = crypto.createHash('sha256').update(msg.request.url).digest('hex');
    const id = `data-${msg.request.processor}-${hash}`;

    var ts = new Date().toISOString();
    item['createdAt'] = ts;
    item['updatedAt'] = ts;

    this.elasticsearch.client.index({
      index: config.elasticsearch.index,
      type: 'document',
      body: item
    });

    return this.couchbase.upsert(id, item);
  }
};
