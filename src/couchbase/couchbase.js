import couchbase from 'couchbase';

import config from '../../config';
import logger from '../logger';

export default class Couchbase {
  constructor() {
    this._client = null;
    this._bucket = null;
    this._manager = null;
  }

  get client() {
    return this._client;
  }

  get manager() {
    return this._manager;
  }

  get bucket() {
    return this._bucket;
  }

  init() {
    return new Promise((resolve, reject) => {
      this._client = new couchbase.Cluster(config.couchbase.uri);
      this._bucket = this._client.openBucket(config.couchbase.bucket, (err) => {
        if(err) {
          return reject(err);
        }
      });

      const defaultTimeout = 10 * 1000;

      this._bucket.connectionTimeout     = config.couchbase.connectionTimeout     || defaultTimeout;
      this._bucket.operationTimeout      = config.couchbase.operationTimeout      || defaultTimeout;
      this._bucket.connectionTimeout     = config.couchbase.connectionTimeout     || defaultTimeout;
      this._bucket.durabilityTimeout     = config.couchbase.durabilityTimeout     || defaultTimeout;
      this._bucket.managementTimeout     = config.couchbase.managementTimeout     || defaultTimeout;
      this._bucket.nodeConnectionTimeout = config.couchbase.nodeConnectionTimeout || defaultTimeout;
      this._bucket.operationTimeout      = config.couchbase.operationTimeout      || defaultTimeout;
      this._bucket.viewTimeout           = config.couchbase.viewTimeout           || defaultTimeout;

      this._bucket.on('connect', (err) => {
        if (err) {
          return reject(err);
        }

        this._manager = this._bucket.manager(config.couchbase.username, config.couchbase.password);
        resolve(this);
      });
    });
  }

  get(id) {
    return new Promise((resolve, reject) => {
      this.bucket.get(id, (err, res) => {
        if (err) {
          if (err.code != 13) {
            logger.error(err);
            return reject(err);
          } else {
            return resolve(null);
          }
        }

        resolve(res);
      });
    });
  }

  upsert(id, data) {
    return new Promise((resolve, reject) => {
      this.bucket.upsert(id, data, (err, res) => {
        if (err) {
          logger.error(err);
          return reject(err);
        }

        resolve(res);
      });
    });
  }
}
