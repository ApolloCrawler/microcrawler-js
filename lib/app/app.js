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

import deferred from 'deferred';
import merge from 'deepmerge';
import elasticsearch from 'elasticsearch';
import Events from 'events';
import nomnom from 'nomnom';
import path from 'path';
import util from 'util';

import Engine from '../engine/engine';
import logger from '../logger';

export default class App extends Events.EventEmitter {
  static defaultOptions = {};

  constructor(opts) {
    super();

    this.opts = merge(App.defaultOptions, opts || {});

    this.stats = {
      items: {
        processed: 0
      }
    };

    return this;
  }

  /**
   * Initialize application
   * @returns {*} Promise
   */
  init() {
    // Load example processor from files
    const processorsDir = path.join(__dirname, '../../examples');

    // First step is to create engine
    this.engine = new Engine(this.opts);

    logger.info("Loading example processors - '" + processorsDir + "'");
    this.engine.loadProcessors(processorsDir);

    if (this.opts.elasticsearch) {
      this.elastic = new elasticsearch.Client({
        host: this.opts['elasticsearch-host'],
        log: 'trace'
      });
    }

    // Register on data event handler
    this.engine.on('data', (result) => {
      if (this.opts.output) {
        logger.info('DATA: ' + JSON.stringify(result, null, 4));
      }

      if (this.elastic) {
        const esObj = {
          index: this.opts['elasticsearch-index'],
          type: this.opts['elasticsearch-type'],
          // id: '1',
          body: result
        };

        this.elastic.create(esObj, function(err) {
          if (err) {
            logger.error(err);
          }
        });
      }

      this.stats.items.processed++;
    });

    // Initialize core Engine
    const res = this.engine.init().then(() => {
      logger.info('Engine Initialized');

      if (this.opts.stats.enabled) {
        this.statsInterval = setInterval(() => {
          this.printStats();
        }, this.opts.stats.interval * 1000);
      }
    });

    return res;
  };

  /**
   * Cleanup application
   * @returns {*} Promise
   */
  cleanup() {
    return new Promise((resolve, reject) => {
      const self = this;
      this.engine.cleanup().then(() => {
        // Cleanup stats if needed
        if (self.opts.stats && self.opts.statsInterval) {
          self.printStats();
          clearInterval(self.statsInterval);
          self.statsInterval = null;
        }

        logger.info('Application cleanup done.');
        return resolve(true);
      });
    });
  };

  /**
   * Process ARGV
   * @param argv
   */
  processArgv(argv) {
    this.opts = nomnom
      .option('elasticsearch', {
        abbr: 'e',
        flag: true,
        default: false,
        help: 'Index data in elasticsearch'
      })
      .option('elasticsearch-host', {
        default: 'localhost:9200',
        help: 'Address of elasticsearch server'
      })
      .option('elasticsearch-index', {
        default: 'default-index',
        help: 'Name of index to be used'
      })
      .option('elasticsearch-type', {
        default: 'default-type',
        help: 'Name of type to be used'
      })
      .option('directory', {
        abbr: 'd',
        default: path.join(__dirname, '../../examples'),
        help: 'Directory with processors'
      })
      .option('flush', {
        abbr: 'f',
        flag: true,
        default: false,
        help: 'Flush existing queue'
      })
      .option('num-connections', {
        abbr: 'n',
        default: 10,
        help: 'Max count of parallel requests'
      })
      .option('output', {
        abbr: 'o',
        flag: true,
        default: true,
        help: 'Print crawled data'
      })
      .option('processor', {
        abbr: 'p',
        help: 'Processor to be used for URLs'
      })
      .option('queue-file', {
        default: 'queue.db',
        help: 'Path where to store SQLite data'
      })
      .option('queue-name', {
        abbr: 'q',
        default: 'queue',
        help: 'Queue name (SQLite Table name)'
      })
      .option('rest', {
        abbr: 'r',
        flag: true,
        default: false,
        help: 'Start Web Interface'
      })
      .option('rest-port', {
        default: 3000,
        help: 'Web Interface port'
      })
      .option('stats', {
        abbr: 's',
        flag: true,
        default: false,
        help: 'Shows statistics'
      })
      .option('stats-interval', {
        abbr: 'i',
        default: 10,
        help: 'Interval between printing statistics'
      })
      .option('version', {
        abbr: 'v',
        flag: true,
        help: 'print version and exit',
        callback: function() {
          // TODO: Read from package json
          return 'version ' + require('../../package.json').version;
        }
      })
      .parse(argv);
  };

  /**
   * Run application
   * @param argv Optional ARGV to be used instead of cli one
   */
  run(argv) {
    // Process argv files
    this.processArgv(argv);

    // TODO: Print only in verbose
    logger.info('ARGV: ' + JSON.stringify(this.argv, null, 4));

    // TODO: Print only in verbose mode
    logger.info('OPTS: ' + JSON.stringify(this.opts, null, 4));

    let rest = null;

    if (this.opts.rest) {
      const Rest = require('../rest');
      rest = new Rest(this.opts);
    }

    // Run the main function - parse args, set processor, enqueue urls specified
    this.init().then(() => {
      logger.info('Application initialized.');
      return this.engine.main(this.opts);
    }).then(() => {
      return this.cleanup();
    }).then(() => {
      // Print finish message
      logger.info('Crawling Done, processed ' + this.stats.items.processed + ' items.');
      if (rest) {
        rest.close();
      }
    }, (err) => {
      // This is handler of error
      logger.error('' + err, err.stack);
    });
  };

  /**
   * Print stats
   */
  printStats() {
    const stats = this.engine.getStats();
    logger.info('STATS: ' + JSON.stringify(stats, null, 4));
  };
}
