// Copyright, 2013-2015, by Tomas Korcak. <korczis@gmail.com>
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

import cheerio from 'cheerio';
import deferred from 'deferred';
import merge from 'deepmerge';
import Events from 'events';
import moment from 'moment';
import path from 'path';
import util from 'util';

import QueueSqlite from '../queue/queueSqlite';

import Helpers from '../helper';
import logger from '../logger';

/**
 * Microcrawler engine implementation
 * @param opts Optional options
 * @returns {Engine}
 * @constructor
 */
export default class Engine extends Events.EventEmitter {
  static defaultOptions = {
    Logger: require('../logger/index'),
    LoggerOpts: {},

    // Queue: require('../queue/queueMemory'),
    Queue: QueueSqlite,
    QueueOpts: null

    // TODO: Add more default options here
  }

  constructor(opts = {}) {
    super();

    this.opts = merge(Engine.defaultOptions, opts);

    this.queue = new this.opts.Queue(merge(this.opts, this.opts.QueueOpts || {}));

    this.processors = {};

    this.stats = {};

    this.finishedAt = null;

    this.processingCount = 0;

    return this;
  }

  /**
   * Initializes async parts of engine
   * @returns {*} Promise
   */
  init() {
    if (this.queue.initialize) {
      return this.queue.initialize();
    }

    return Promise.resolve(this);
  }

  cleanup() {
    logger.info('Engine cleanup done.');

    return Promise.resolve(true);
  }

  /**
   * Gets statistics about engine
   * @returns {{queue: {requested: *, processing: *, done: *, failed: *}}}
   */
  getStats() {
    const mem = process.memoryUsage();

    const now = moment();

    const queue = {
      requested: this.queue.count('requested'),
      processing: this.queue.count('processing'),
      done: this.queue.count('done'),
      failed: this.queue.count('failed')
    };
    const totalCount = queue.requested + queue.processing + queue.done + queue.failed;

    const time = {
      startedAt: this.stats.startTime,
      now: now,
      elapsed: (now - this.stats.startTime) * 0.001
    };

    const res = {
      mem: mem,
      queue: queue,
      speed: {
        requested: queue.requested / time.elapsed,
        processing: queue.processing / time.elapsed,
        done: queue.done / time.elapsed,
        failed: queue.failed / time.elapsed,
        overall: totalCount / time.elapsed
      },
      time: time
    };

    return res;
  }

  /**
   * Loads one processor specified by full path from directory of processors
   * @param pathDir Directory with processors (used for calculating relative path)
   * @param fullPath Full path to processor to be loaded
   * @returns {{name: (XML|string), path: *, processor: (Object|*)}}
   */
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

  /**
   * Loads and register processor from path (dir)
   *
   * The name of processor is generated in following way:
   *
   * * The extension is stripped
   * * path.sep is converted to dot ('.')
   *
   * Example filename to processor name transformation:
   *
   * 'google/listing.js' -> 'google.listing'
   *
   * @param pathDir Dir with processors (each in own folder) to be loaded
   * @returns {*} Promise
   */
  loadProcessors(pathDir) {
    return new Promise((resolve, reject) => {
      Helpers.walk(pathDir, (err, results) => {
        if (err) {
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

  /**
   * Main CLI function
   *
   * Workflow is following:
   *
   * * Parse CLI arguments
   * * Process requested URLS
   *
   * @returns {*} Promise which is resolved when all work is done
   */
  main(argv) {
    if (argv.directory) {
      let loadPaths = null;
      if (Object.prototype.toString.call(argv.directory) !== '[object Array]') {
        loadPaths = [argv.directory];
      } else {
        loadPaths = argv.directory;
      }

      logger.info("Loading processors from following paths - '" + loadPaths + "'");
      for (let i = 0; i < loadPaths.length; i++) {
        this.loadProcessors(path.resolve(loadPaths[i]));
      }
    }

    for (let j = 0; j < argv._.length; j++) {
      const url = argv._[j];

      this.enqueueUrl({
        url: url,
        processor: argv.processor
      });
    }

    // Now just launch the engine and wait for results
    return this.run();
  }

  registerProcessor(name, processor) {
    if (!name) {
      throw new TypeError('name must be specified');
    }

    this.processors[name] = processor;
    return processor;
  }

  /**
   * Process this.queue.requested urls
   *
   * It means following:
   *
   * * Iterate over all this.queue.requested.items
   * * Remove from this.queue.requested
   * * processRequested() each of them - will add item to this.queue.processing
   *
   * @returns {number} Number of processed items
   */
  process() {
    if (this.processingCount >= this.opts['num-connections']) {
      return Promise.resolve(true);
    }

    this.getNextRequested().then((item) => {
      if (item) {
        this.processRequested(item);
      }
    });

    return Promise.resolve(true);
  }

  /**
   * Processes one requested URL/item
   *
   * It means following:
   *
   * * Push to this.queue.processing
   * * Do deferred HTTP request of item.url and than
   * * Load data to cheerio
   * * Call processor specified (ie, yelp.details)
   * * this.processFinishedResults()
   * * this.finishRequestedItem() - move from this.queue.processing -> this.queue.done
   *
   * @param item Item requested to be processed
   */
  processRequested(item) {
    return new Promise((resolve, reject) => {
      this.addProcessing(item).then(() => {
        this.processingCount++;
        return Helpers.Request.request(item.url).then((data) => {
          const doc = cheerio.load(data);
          const res = this.processors[item.processor](doc, item);

          // TODO: We should wait for processFinishedResults and than finishRequested
          this.processFinishedResults(item, res);
          return resolve(this.finishRequested(item));
        });
      }).then(() => {
        // Handle final result
        this.processingCount--;
      }, (err) => {
        // Handle error
        this.queue.move(item, 'processing', 'failed');
        this.processingCount--;
        throw err;
      });

    });
  }

  /**
   * Processes results returned by registered and used page processor
   *
   * It means following:
   *
   * * All results are iterated
   * * Results of {type: 'url'} are queued (behavior depends on Queue.enqueueUrl() implementation
   * * Results of {type: 'data'} are emitted using EventEmitter
   *
   * @param results Results to be processed
   */
  processFinishedResults(item, results) {
    const data = results.filter(function(result) {
      return result.type === 'data';
    });

    const urls = results.filter(function(result) {
      return result.type === 'url';
    });

    // Process data
    for (let i = 0; i < data.length; i++) {
      const result = data[i];
      if (!result.data.processor) {
        result.data.processor = item.processor;
      }

      const date = new Date();
      const ts = date.getTime();
      result.ts = {
        createdAt: date.toUTCString(),
        updatedAt: date.toUTCString(),
        createdAtTs: ts,
        updatedAtTs: ts
      };

      this.emit('data', result);
    }

    let d = null;
    for (let i = 0; i < urls.length; i++) {
      const result = urls[i];

      const args = {
        url: result.url,
        processor: result.processor,
        data: result.data
      };

      if (!d) {
        d = this.enqueueUrl(args);
      } else {
        d = d.then(this.enqueueUrl(args));
      }
    }
    return d;
  }

  /**
   * Kick of first tick and keep running until necessary
   *
   * @returns {*} Promise to be resolved when done
   */
  run() {
    const d = deferred();

    if (!this.stats.startTime) {
      this.stats.startTime = moment();
    }

    this.scheduleTick(d);

    return d.promise();
  }

  /**
   * Schedule next tick
   * @param d Promise to be passed to tick function
   */
  scheduleTick(d) {
    const self = this;
    setTimeout(function() {
      self.tick(d);
    }, 10);

    return d;
  }

  /**
   * Performs one engine tick
   *
   * It means following:
   *
   * * Check if everything isCrawlingDone()
   * * Resolves promise if done
   * * Schedules next processing tick if not done
   *
   *  @param d Promise
   */
  tick(d) {
    const self = this;
    this.process().then(function() {
      return self.isCrawlingDone();
    }).then((res) => {
      if (res) {
        d.resolve(this);
      } else {
        self.scheduleTick(d);
      }
    });
  }

  /**
   * Enqueue new URL and specify processor to parse page (and optionally the data passed)
   *
   * Procedure is following:
   *
   * * Checks if wasAlreadyEnqueued() and returns if co
   * * Generates boxing structure wih following info
   *   * guid - generated using Helpers.guid()
   *   * url - url to be processed
   *   * processor - name of previously registered processor to parse results
   *
   * @param item Item to be queued
   * @returns {boolean} True if newly queued, false if already queued (or processing, done, failed ...)
   */
  enqueueUrl(item) {
    return new Promise((resolve, reject) => {
      const self = this;
      this.wasAlreadyEnqueued(item).then(function(res) {
        if (res) {
          logger.info('Item ALREADY queued: ' + JSON.stringify(item, null, 4));
          return resolve(false);
        }

        return self.queue.put(item, 'requested');
      }).then(function(res) {
        if (res) {
          logger.info('Item NEWLY queued: ' + JSON.stringify(item, null, 4));
        } else {
          logger.info('Item FAILED to be queued: ' + JSON.stringify(item, null, 4));
        }

        resolve(item);
      });
    });
  }

  /**
   * Process finished request
   *
   * It means following:
   *
   * * Remove item from this.queue.processing
   * * Add item to this.queue.done
   *
   * @param item Item to be moved from this.queue.processing to this.queue.done
   * @returns {boolean} True if the move happened
   */
  finishRequested(item) {
    return this.queue.move(item, 'processing', 'done');
  }

  /**
   * Returns true if all request were processed
   *
   * It means following:
   *
   * * this.queue.requested is empty
   * * this.queue.processing is empty
   *
   * TODO: Decide how to handle failed items
   *
   * @returns {boolean} True if everything was processed
   */
  isCrawlingDone() {
    const d = deferred();

    const self = this;
    this.queue.count('requested').then(function(res) {
      if (res > 0) {
        return d.resolve(false);
      }

      return self.queue.count('processing');
    }).then(function(result) {
      const res = result === 0;

      if (res) {
        if (!self.finishedAt) {
          self.finishedAt = Date.now();
        }

        if (Date.now() - self.finishedAt > 3000) {
          d.resolve(true);
        } else {
          d.resolve(false);
        }
      } else {
        self.finishedAt = null;
      }

      return d.resolve(res);
    }).done();

    return d.promise();
  }

  getNextRequested() {
    return this.queue.get('requested');
  }

  addProcessing(item) {
    return this.queue.move(item, 'requested', 'processing');
  }

  /**
   * Checks if specified combination of url and processor was already enqueued
   * @param url Url to be queued
   * @param processor Processor to be used for processing url
   * @returns {boolean} True if already queued (or processing, or done or failed)
   */
  wasAlreadyEnqueued(item) {
    const queues = [
      'requested',
      'processing',
      'done',
      'failed'
    ];

    return this.queue.exist(item, queues);
  }
}

