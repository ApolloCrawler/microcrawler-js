// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
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

(function () {
    'use strict';

    var define = require('amdefine')(module);

    /**
     * Array of modules this one depends on.
     * @type {Array}
     */
    var deps = [
        'deferred',
        'deepmerge',
        'elasticsearch',
        'events',
        'nomnom',
        'path',
        'util'
    ];

    define(deps, function (deferred, merge, elasticsearch, Events, nomnom, path, util) {
        var Engine = require('../engine');
        var logger = require('../logger');

        function App(opts) {
            // deferred.monitor();

            if(!opts) {
                opts = {};
            }

            this.opts = merge(App.defaultOptions, opts);

            this.stats = {
                items: {
                    processed: 0
                }
            };

            return this;
        };

        util.inherits(App, Events.EventEmitter);

        App.defaultOptions = {

        };

        /**
         * Cleanup application
         * @returns {*} Promise
         */
        App.prototype.cleanup = function () {
            var d = deferred();

            var self = this;
            this.engine.cleanup().done(function () {
                // Cleanup stats if needed
                if (self.opts.stats && self.opts.statsInterval) {
                    self.printStats();
                    clearInterval(self.statsInterval);
                    self.statsInterval = null;
                }

                logger.info("Application cleanup done.");
                return d.resolve(true);
            });

            return d.promise()
        };

        /**
         * Initialize application
         * @returns {*} Promise
         */
        App.prototype.init = function () {
            var d = deferred();

            // Load example processor from files
            var processorsDir = path.join(__dirname, '../../examples');

            // First step is to create engine
            this.engine = new Engine(this.opts);

            logger.info("Loading example processors - '" + processorsDir + "'");
            this.engine.loadProcessors(processorsDir);

            var self = this;

            // Register on data event handler
            this.engine.on('data', function (result) {
                if (self.opts.output) {
                    logger.info('DATA: ' + JSON.stringify(result, null, 4));
                }

                if(self.elastic) {
                    self.elastic.create({
                        index: 'myindex',
                        type: 'mytype',
                        // id: '1',
                        body: result.data
                    }, function (err, response) {
                        if(err) {
                            logger.error(err);
                        }
                    });
                }

                self.stats.items.processed++;
            });

            // Initialize core Engine
            var res = this.engine.init().then(function () {
                logger.info("Engine Initialized");

                var d = deferred();
                return d.resolve(true);
            });

            // Promise done handler
            res.done(function () {
                // Initialize options if enabled
                if (self.opts.stats.enabled) {
                    self.statsInterval = setInterval(function () {
                        self.printStats();
                    }, self.opts.stats.interval * 1000);
                }

                d.resolve(true);
            });

            return d.promise();
        };

        /**
         * Process ARGV
         * @param argv
         */
        App.prototype.processArgv = function (argv) {
            this.opts = nomnom
                .option('elasticsearch', {
                    abbr: 'e',
                    flag: true,
                    default: false,
                    help: 'Index data in elasticsearch'
                })
                .option('directory', {
                    abbr: 'd',
                    default: path.join(__dirname, '../../examples'),
                    help: 'Directory with processors'
                })
                .option('flush', {
                    abbr: 'f',
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
         * Print stats
         */
        App.prototype.printStats = function () {
            var stats = this.engine.getStats();
            logger.info('STATS: ' + JSON.stringify(stats, null, 4));
        };

        /**
         * Run application
         * @param argv Optional ARGV to be used instead of cli one
         */
        App.prototype.run = function (argv) {
            // Process argv files
            this.processArgv(argv);

            // TODO: Print only in verbose
            logger.info("ARGV: " + JSON.stringify(this.argv, null, 4));

            // TODO: Print only in verbose mode
            logger.info("OPTS: " + JSON.stringify(this.opts, null, 4));

            var self = this;

            var rest = null;

            if(this.opts.rest) {
                var Rest = require('../rest');
                rest = Rest(this.opts);
            }

            // Run the main function - parse args, set processor, enqueue urls specified
            this.init().then(function () {
                logger.info('Application initialized.');
                return self.engine.main(self.opts);
            }).then(function () {
                return self.cleanup();
            }).done(function () {
                // Print finish message
                logger.info('Crawling Done, processed ' + self.stats.items.processed + ' items.');
                if(rest) {
                    rest.close();
                }
            }, function (err) {
                // This is handler of error
                logger.error('' + err);
            });
        };

        // Export App
        module.exports = App;
    });
}());