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

import couchbase from 'couchbase';

import {config} from '../config';
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
        if (err) {
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
          if (err.code !== 13) {
            logger.error(err);
            return reject(err);
          }

          return resolve(null);
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
